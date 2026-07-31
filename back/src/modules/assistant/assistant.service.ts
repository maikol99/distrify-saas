import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Products } from '../products/products.schema';
import { Sales } from '../sales/sales.schema';
import { Clients } from '../clients/clients.schema';
import { Suppliers } from '../suppliers/supplier.schema';
import { Caja } from '../caja/caja.schema';
import { Buys } from '../buys/buys.schema';

@Injectable()
export class AssistantService {
  private groq: Groq;
  private readonly logger = new Logger(AssistantService.name);
  private readonly MODEL = 'llama-3.3-70b-versatile';

  constructor(
    private configService: ConfigService,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Clients.name) private clientsModel: Model<Clients>,
    @InjectModel(Suppliers.name) private suppliersModel: Model<Suppliers>,
    @InjectModel(Caja.name) private cajaModel: Model<Caja>,
    @InjectModel(Buys.name) private buysModel: Model<Buys>,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async chat(userMessage: string, shopId: string, chatHistory: any[] = []) {
    try {
      // Normalizar historial al formato OpenAI { role: 'user'|'assistant', content: string }
      const normalizedHistory: Groq.Chat.ChatCompletionMessageParam[] = chatHistory.map((msg) => {
        const role = msg.role === 'model' ? 'assistant' : (msg.role ?? 'user');
        let content = '';
        if (typeof msg.content === 'string') content = msg.content;
        else if (Array.isArray(msg.parts)) content = msg.parts.map((p: any) => p.text ?? '').join('');
        else content = String(msg.content ?? '');
        return { role, content } as Groq.Chat.ChatCompletionMessageParam;
      });

      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.getSystemPrompt() },
        ...normalizedHistory,
        { role: 'user', content: userMessage },
      ];

      const response = await this.groq.chat.completions.create({
        model: this.MODEL,
        messages,
        tools: this.getTools() as any,
        tool_choice: 'auto',
        temperature: 0.2,
        max_tokens: 2048,
      });

      const choice = response.choices?.[0];
      const toolCalls = choice?.message?.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        this.logger.log(`Tool call: ${name} — ${JSON.stringify(args)}`);

        let result: any;
        if (name.startsWith('query_')) {
          result = await this.executeQuery(name, args, shopId);
        } else if (name.startsWith('preview_')) {
          result = await this.executePreview(name, args, shopId);
        } else {
          result = await this.executeCreate(name, args, shopId);
        }

        // Si es preview, retornar datos estructurados directo para que el frontend renderice la tarjeta
        if (result?.__type === 'preview') {
          return result;
        }

        // Segunda llamada para generar respuesta natural con el resultado del tool
        const followupMessages: Groq.Chat.ChatCompletionMessageParam[] = [
          ...messages,
          choice.message as Groq.Chat.ChatCompletionMessageParam,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          },
        ];

        const followup = await this.groq.chat.completions.create({
          model: this.MODEL,
          messages: followupMessages,
          temperature: 0.3,
          max_tokens: 1024,
        });

        return followup.choices?.[0]?.message?.content ?? '';
      }

      return choice?.message?.content ?? '';
    } catch (error) {
      this.logger.error('Error en AssistantService', error);
      throw error;
    }
  }

  // ─── Tools definition (OpenAI/Groq format) ────────────────────────────────

  private getTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'query_sales',
          description: 'Consulta ventas del negocio: total vendido hoy, últimas ventas, etc.',
          parameters: {
            type: 'object',
            properties: {
              query_type: { type: 'string', enum: ['total', 'count', 'list', 'today'] },
              date_from: { type: 'string' },
              date_to: { type: 'string' },
              client_name: { type: 'string' },
            },
            required: ['query_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_inventory',
          description: 'Consulta inventario o stock de productos.',
          parameters: {
            type: 'object',
            properties: {
              query_type: { type: 'string', enum: ['low_stock', 'count', 'list', 'search'] },
              product_name: { type: 'string' },
              low_stock_threshold: { type: 'number' },
            },
            required: ['query_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_clients',
          description: 'Consulta los clientes registrados.',
          parameters: {
            type: 'object',
            properties: {
              query_type: { type: 'string', enum: ['count', 'list', 'search', 'with_debt'] },
              client_name: { type: 'string' },
            },
            required: ['query_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_suppliers',
          description: 'Consulta proveedores registrados.',
          parameters: {
            type: 'object',
            properties: {
              query_type: { type: 'string', enum: ['count', 'list', 'search', 'with_debt'] },
              supplier_name: { type: 'string' },
            },
            required: ['query_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'query_caja',
          description: 'Consulta estado y balance de la caja registradora.',
          parameters: {
            type: 'object',
            properties: {
              query_type: { type: 'string', enum: ['current', 'summary', 'last_closed'] },
            },
            required: ['query_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'preview_sale',
          description: 'Genera previsualización de una venta nueva.',
          parameters: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product_name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit_price: { type: 'number' },
                  },
                  required: ['product_name', 'quantity'],
                },
              },
              client_name: { type: 'string' },
              payment_method: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Credito', 'Debito', 'Cuenta corriente'] },
              discount: { type: 'number' },
            },
            required: ['items'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'confirm_sale',
          description: 'Confirma y crea una venta ya previsualizada.',
          parameters: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product_id: { type: 'string' },
                    product_name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit_price: { type: 'number' },
                  },
                  required: ['product_id', 'quantity', 'unit_price'],
                },
              },
              client_id: { type: 'string' },
              client_name: { type: 'string' },
              payment_method: { type: 'string' },
              subtotal: { type: 'number' },
              discount: { type: 'number' },
              total: { type: 'number' },
            },
            required: ['items', 'total'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'preview_product',
          description: 'Previsualiza un producto nuevo antes de guardarlo.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              buyPrice: { type: 'number' },
              sellPrice: { type: 'number' },
              quantity: { type: 'number' },
              category: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name', 'code', 'buyPrice', 'sellPrice'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'confirm_product',
          description: 'Crea el producto definitivo en la base de datos.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              buyPrice: { type: 'number' },
              sellPrice: { type: 'number' },
              quantity: { type: 'number' },
              category: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name', 'code', 'buyPrice', 'sellPrice'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'preview_client',
          description: 'Previsualiza un cliente nuevo antes de guardarlo.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'confirm_client',
          description: 'Crea el cliente definitivo en la base de datos.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'preview_supplier',
          description: 'Previsualiza un proveedor nuevo antes de guardarlo.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              cuit: { type: 'string' },
              company: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'confirm_supplier',
          description: 'Crea el proveedor definitivo en la base de datos.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              cuit: { type: 'string' },
              company: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'preview_purchase',
          description: 'Previsualiza una compra a proveedor antes de guardarla.',
          parameters: {
            type: 'object',
            properties: {
              supplier_name: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product_name: { type: 'string' },
                    quantity: { type: 'number' },
                    buy_price: { type: 'number' },
                  },
                  required: ['product_name', 'quantity', 'buy_price'],
                },
              },
              payment_method: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['supplier_name', 'items'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'confirm_purchase',
          description: 'Crea la compra definitiva en la base de datos.',
          parameters: {
            type: 'object',
            properties: {
              supplier_id: { type: 'string' },
              supplier_name: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    product_id: { type: 'string' },
                    product_name: { type: 'string' },
                    quantity: { type: 'number' },
                    buy_price: { type: 'number' },
                  },
                  required: ['product_id', 'quantity', 'buy_price'],
                },
              },
              total: { type: 'number' },
              payment_method: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['supplier_id', 'items', 'total'],
          },
        },
      },
    ];
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  private async executeQuery(fnName: string, args: any, shopId: string) {
    switch (fnName) {
      case 'query_sales':     return this.querySales(args, shopId);
      case 'query_inventory': return this.queryInventory(args, shopId);
      case 'query_clients':   return this.queryClients(args, shopId);
      case 'query_suppliers': return this.querySuppliers(args, shopId);
      case 'query_caja':      return this.queryCaja(args, shopId);
      default: return { error: 'Consulta no reconocida' };
    }
  }

  // ─── Previews ──────────────────────────────────────────────────────────────

  private async executePreview(fnName: string, args: any, shopId: string) {
    switch (fnName) {
      case 'preview_sale':     return this.previewSale(args, shopId);
      case 'preview_product':  return this.previewProduct(args);
      case 'preview_client':   return this.previewClient(args);
      case 'preview_supplier': return this.previewSupplier(args);
      case 'preview_purchase': return this.previewPurchase(args, shopId);
      default: return { error: 'Preview no reconocido' };
    }
  }

  private async previewSale(args: any, shopId: string) {
    const resolvedItems: any[] = [];
    const warnings: string[] = [];

    for (const item of args.items) {
      const results = await this.searchProducts(shopId, item.product_name, 1);
      const product = results[0] ?? null;

      if (!product) {
        warnings.push(`Producto "${item.product_name}" no encontrado en el inventario.`);
        continue;
      }

      const unitPrice = item.unit_price ?? product.sellPrice;
      resolvedItems.push({
        product_id: product._id.toString(),
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: unitPrice * item.quantity,
        current_stock: product.quantity,
      });
    }

    if (resolvedItems.length === 0) {
      return { error: 'No se encontró ningún producto en el inventario para la venta.' };
    }

    const subtotal = resolvedItems.reduce((s, i) => s + i.subtotal, 0);
    const discountPct = args.discount ?? 0;
    const discountAmount = subtotal * (discountPct / 100);
    const total = subtotal - discountAmount;

    // Buscar cliente si se especificó
    let clientId: string | null = null;
    let clientName: string | null = args.client_name ?? null;
    if (args.client_name) {
      const client = await this.clientsModel
        .findOne({ shopId, name: { $regex: args.client_name, $options: 'i' } })
        .lean();
      if (client) {
        clientId = client._id.toString();
        clientName = client.name;
      }
    }

    return {
      __type: 'preview',
      preview_kind: 'sale',
      data: {
        items: resolvedItems,
        client_id: clientId,
        client_name: clientName,
        payment_method: args.payment_method ?? 'Efectivo',
        subtotal,
        discount: discountPct,
        discount_amount: discountAmount,
        total,
      },
      warnings,
    };
  }

  private previewProduct(args: any) {
    const utilidad = args.buyPrice > 0
      ? Math.round(((args.sellPrice - args.buyPrice) / args.buyPrice) * 100)
      : 0;

    return {
      __type: 'preview',
      preview_kind: 'product',
      data: {
        name: args.name,
        code: args.code,
        buyPrice: args.buyPrice,
        sellPrice: args.sellPrice,
        quantity: args.quantity ?? 0,
        category: args.category ?? null,
        description: args.description ?? null,
        utilidad,
      },
      warnings: [],
    };
  }

  private previewClient(args: any) {
    return {
      __type: 'preview',
      preview_kind: 'client',
      data: {
        name: args.name,
        email: args.email ?? null,
        phone: args.phone ?? null,
        address: args.address ?? null,
      },
      warnings: [],
    };
  }

  private previewSupplier(args: any) {
    return {
      __type: 'preview',
      preview_kind: 'supplier',
      data: {
        name: args.name,
        email: args.email ?? null,
        phone: args.phone ?? null,
        address: args.address ?? null,
        cuit: args.cuit ?? null,
        company: args.company ?? null,
      },
      warnings: [],
    };
  }

  private async previewPurchase(args: any, shopId: string) {
    // Resolver proveedor
    const supplier = await this.suppliersModel
      .findOne({ shopId, name: { $regex: args.supplier_name, $options: 'i' } })
      .lean();

    const resolvedItems: any[] = [];
    const warnings: string[] = [];

    for (const item of args.items) {
      const results = await this.searchProducts(shopId, item.product_name, 1);
      const product = results[0] ?? null;

      if (!product) {
        warnings.push(`Producto "${item.product_name}" no encontrado.`);
        continue;
      }

      resolvedItems.push({
        product_id: product._id.toString(),
        product_name: product.name,
        quantity: item.quantity,
        buy_price: item.buy_price,
        subtotal: item.buy_price * item.quantity,
        current_stock: product.quantity,
      });
    }

    if (resolvedItems.length === 0) {
      return { error: 'No se encontró ningún producto para la compra.' };
    }

    const total = resolvedItems.reduce((s, i) => s + i.subtotal, 0);

    return {
      __type: 'preview',
      preview_kind: 'purchase',
      data: {
        supplier_id: supplier?._id?.toString() ?? null,
        supplier_name: supplier?.name ?? args.supplier_name,
        supplier_found: !!supplier,
        items: resolvedItems,
        total,
        payment_method: args.payment_method ?? 'Efectivo',
        notes: args.notes ?? null,
      },
      warnings: !supplier
        ? [...warnings, `Proveedor "${args.supplier_name}" no encontrado. Se registrará sin proveedor asociado.`]
        : warnings,
    };
  }

  // ─── Creates ───────────────────────────────────────────────────────────────

  private async executeCreate(fnName: string, args: any, shopId: string) {
    switch (fnName) {
      case 'confirm_sale':     return this.confirmSale(args, shopId);
      case 'confirm_product':  return this.confirmProduct(args, shopId);
      case 'confirm_client':   return this.confirmClient(args, shopId);
      case 'confirm_supplier': return this.confirmSupplier(args, shopId);
      case 'confirm_purchase': return this.confirmPurchase(args, shopId);
      default: return { success: false, message: 'Acción no reconocida' };
    }
  }

  private async confirmSale(args: any, shopId: string) {
    try {
      const productDetails = args.items.map((item: any) => ({
        productId: new Types.ObjectId(item.product_id),
        quantity: item.quantity,
      }));

      const subtotal = args.subtotal ?? args.total;

      // Proteger client_id vacío o inválido
      const clientId = args.client_id && Types.ObjectId.isValid(args.client_id)
        ? new Types.ObjectId(args.client_id)
        : undefined;

      // shopId como string igual que el resto del sistema (el schema lo convierte)
      const sale = await this.salesModel.create({
        shopId,
        productDetails,
        clientId,
        clientName: args.client_name && args.client_name !== 'Sin cliente' ? args.client_name : undefined,
        subtotal,
        discount: args.discount ?? 0,
        total: args.total,
        paymentMethod: args.payment_method ?? 'Efectivo',
        status: 'Completado',
        creationDate: new Date(),
        cashier: 'Asistente IA',
        isCancelled: false,
      });

      this.logger.log(`Venta creada: ${sale._id} — shopId: ${shopId} — Total: $${args.total}`);

      // Descontar stock
      for (const item of args.items) {
        await this.productsModel.findByIdAndUpdate(item.product_id, {
          $inc: { quantity: -item.quantity },
        });
      }

      return {
        success: true,
        id: sale._id.toString(),
        total: args.total,
        items_count: args.items.length,
      };
    } catch (error) {
      this.logger.error('Error al crear venta:', error);
      return { success: false, message: error.message };
    }
  }

  private async confirmProduct(args: any, shopId: string) {
    const product = await this.productsModel.create({
      shopId,
      name: args.name,
      code: args.code,
      buyPrice: args.buyPrice,
      sellPrice: args.sellPrice,
      quantity: args.quantity ?? 0,
      category: args.category,
      description: args.description,
      creationDate: new Date(),
    });
    this.logger.log(`Producto creado: ${product._id} — shopId: ${shopId}`);
    return { success: true, id: product._id.toString(), name: args.name };
  }

  private async confirmClient(args: any, shopId: string) {
    const client = await this.clientsModel.create({
      shopId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      debt: 0,
    });
    this.logger.log(`Cliente creado: ${client._id} — shopId: ${shopId}`);
    return { success: true, id: client._id.toString(), name: args.name };
  }

  private async confirmSupplier(args: any, shopId: string) {
    const supplier = await this.suppliersModel.create({
      shopId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      cuit: args.cuit,
      company: args.company,
      debt: 0,
      creationDate: new Date(),
    });
    this.logger.log(`Proveedor creado: ${supplier._id} — shopId: ${shopId}`);
    return { success: true, id: supplier._id.toString(), name: args.name };
  }

  private async confirmPurchase(args: any, shopId: string) {
    const productDetails = args.items.map((item: any) => ({
      productId: new Types.ObjectId(item.product_id),
      quantity: item.quantity,
    }));

    const products = args.items.map((item: any) => ({
      productId: new Types.ObjectId(item.product_id),
      quantity: item.quantity,
      buyPrice: item.buy_price,
    }));

    const buy = await this.buysModel.create({
      shopId,
      supplierId: args.supplier_id && Types.ObjectId.isValid(args.supplier_id)
        ? new Types.ObjectId(args.supplier_id)
        : undefined,
      supplierName: args.supplier_name,
      productDetails,
      products,
      total: args.total,
      paymentMethod: args.payment_method ?? 'Efectivo',
      notes: args.notes,
      creationDate: new Date(),
      date: new Date(),
      isPaid: true,
      productsAdded: false,
    });
    this.logger.log(`Compra creada: ${buy._id} — shopId: ${shopId}`);

    return {
      success: true,
      id: buy._id.toString(),
      total: args.total,
      supplier: args.supplier_name,
    };
  }

  // ─── Query implementations ─────────────────────────────────────────────────

  private async querySales(args: any, shopId: string) {
    const shopIdObj = Types.ObjectId.isValid(shopId) ? new Types.ObjectId(shopId) : shopId;
    const filter: any = {
      $or: [
        { shopId: shopIdObj },
        { shopId: shopId }
      ],
      status: 'Completado'
    };

    let dateField = 'creationDate';

    if (args.query_type === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filter.$and = [
        {
          $or: [
            { creationDate: { $gte: today, $lt: tomorrow } },
            { createdAt: { $gte: today, $lt: tomorrow } }
          ]
        }
      ];
    } else if (args.date_from || args.date_to) {
      const dateSubFilter: any = {};
      if (args.date_from && !isNaN(Date.parse(args.date_from))) {
        dateSubFilter.$gte = new Date(args.date_from);
      }
      if (args.date_to && !isNaN(Date.parse(args.date_to))) {
        const to = new Date(args.date_to);
        to.setHours(23, 59, 59, 999);
        dateSubFilter.$lte = to;
      }
      // Solo aplicar el filtro si hay alguna condición válida
      if (Object.keys(dateSubFilter).length > 0) {
        filter.$and = [
          {
            $or: [
              { creationDate: dateSubFilter },
              { createdAt: dateSubFilter }
            ]
          }
        ];
      }
    }

    if (args.client_name) {
      filter.clientName = { $regex: args.client_name, $options: 'i' };
    }

    const sales = await this.salesModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(args.query_type === 'list' ? 10 : 500)
      .lean();

    const total = sales.reduce((sum, s) => sum + (s.total || 0), 0);

    if (args.query_type === 'list') {
      return {
        count: sales.length,
        total,
        items: sales.slice(0, 10).map((s) => ({
          fecha: s.creationDate,
          cliente: s.clientName || 'Sin cliente',
          total: s.total,
          metodo: s.paymentMethod,
        })),
      };
    }

    return {
      count: sales.length,
      total,
      period:
        args.query_type === 'today'
          ? 'hoy'
          : args.date_from
          ? `${args.date_from} — ${args.date_to || 'hoy'}`
          : 'general',
    };
  }

  private buildProductSearchFilter(productName: string): any {
    // Dividir en palabras y armar regex que requiera cada palabra (en cualquier orden)
    const words = productName.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      return { $regex: productName, $options: 'i' };
    }
    // Cada palabra debe aparecer en el nombre (AND implícito con lookaheads)
    const combined = words.map(w => `(?=.*${w})`).join('');
    return { $regex: combined, $options: 'i' };
  }

  private async searchProducts(shopId: string, productName: string, limit = 10) {
    const base: any = { shopId };
    // Primero intenta match con todas las palabras
    let products = await this.productsModel
      .find({ ...base, name: this.buildProductSearchFilter(productName) })
      .limit(limit).lean();

    // Si no encuentra nada, busca por cada palabra individualmente y une resultados
    if (products.length === 0) {
      const words = productName.trim().split(/\s+/).filter(Boolean);
      const orFilters = words.map(w => ({
        $or: [
          { name: { $regex: w, $options: 'i' } },
          { code: { $regex: w, $options: 'i' } },
        ],
      }));
      products = await this.productsModel
        .find({ ...base, $and: orFilters.length ? orFilters : [{}] })
        .limit(limit).lean();
    }

    // Último recurso: busca también por código
    if (products.length === 0) {
      products = await this.productsModel
        .find({ ...base, code: { $regex: productName, $options: 'i' } })
        .limit(limit).lean();
    }

    return products;
  }

  private async queryInventory(args: any, shopId: string) {
    const filter: any = { shopId };

    if (args.query_type === 'search' && args.product_name) {
      const products = await this.searchProducts(shopId, args.product_name, 10);
      return {
        count: products.length,
        items: products.map((p) => ({
          nombre: p.name,
          stock: p.quantity,
          precioVenta: p.sellPrice,
          codigo: p.code,
          categoria: p.category,
        })),
      };
    }

    if (args.query_type === 'low_stock') {
      const threshold = args.low_stock_threshold ?? 5;
      filter.quantity = { $lte: threshold };
      const products = await this.productsModel.find(filter).limit(50).lean();
      return {
        count: products.length,
        threshold,
        items: products.map((p) => ({
          nombre: p.name,
          stock: p.quantity,
          minimo: p.minQuantity ?? 0,
          codigo: p.code,
        })),
      };
    }

    if (args.query_type === 'count') {
      const count = await this.productsModel.countDocuments(filter);
      return { count };
    }

    const products = await this.productsModel.find(filter).limit(20).lean();
    return {
      count: products.length,
      items: products.map((p) => ({
        nombre: p.name,
        stock: p.quantity,
        precioVenta: p.sellPrice,
        codigo: p.code,
      })),
    };
  }

  private async queryClients(args: any, shopId: string) {
    const filter: any = { shopId };

    if (args.query_type === 'search' && args.client_name) {
      filter.name = { $regex: args.client_name, $options: 'i' };
    }
    if (args.query_type === 'with_debt') {
      filter.debt = { $gt: 0 };
    }
    if (args.query_type === 'count') {
      const count = await this.clientsModel.countDocuments(filter);
      return { count };
    }

    const clients = await this.clientsModel.find(filter).limit(20).lean();
    return {
      count: clients.length,
      items: clients.map((c) => ({
        nombre: c.name,
        email: c.email,
        telefono: c.phone,
        deuda: c.debt ?? 0,
      })),
    };
  }

  private async querySuppliers(args: any, shopId: string) {
    const filter: any = { shopId };

    if (args.query_type === 'search' && args.supplier_name) {
      filter.name = { $regex: args.supplier_name, $options: 'i' };
    }
    if (args.query_type === 'with_debt') {
      filter.debt = { $gt: 0 };
    }
    if (args.query_type === 'count') {
      const count = await this.suppliersModel.countDocuments(filter);
      return { count };
    }

    const suppliers = await this.suppliersModel.find(filter).limit(20).lean();
    return {
      count: suppliers.length,
      items: suppliers.map((s) => ({
        nombre: s.name,
        email: s.email,
        telefono: s.phone,
        deuda: s.debt ?? 0,
        empresa: s.company,
      })),
    };
  }

  private async queryCaja(args: any, shopId: string) {
    if (args.query_type === 'current') {
      const caja = await this.cajaModel
        .findOne({ shopId, estado: 'abierta' })
        .lean();
      if (!caja)
        return { estado: 'cerrada', mensaje: 'No hay caja abierta actualmente.' };
      return {
        estado: 'abierta',
        fechaApertura: caja.fechaApertura,
        totalVentas: caja.totalCaja?.totalVentas ?? 0,
        totalCompras: caja.totalCaja?.totalCompras ?? 0,
        totalGastos: caja.totalCaja?.totalGastos ?? 0,
        totalIngresos: caja.totalCaja?.totalIngresos ?? 0,
      };
    }

    if (args.query_type === 'last_closed') {
      const caja = await this.cajaModel
        .findOne({ shopId, estado: 'cerrada' })
        .sort({ fechaCierre: -1 })
        .lean();
      if (!caja) return { mensaje: 'No hay cajas cerradas.' };
      return {
        fechaCierre: caja.fechaCierre,
        totalVentas: caja.totalCaja?.totalVentas ?? 0,
        balanceFinal: caja.arqueoFinal?.balanceFinal ?? 0,
      };
    }

    const count = await this.cajaModel.countDocuments({ shopId });
    return { totalCajas: count };
  }

  // ─── System prompt ─────────────────────────────────────────────────────────

  private getSystemPrompt(): string {
    const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `Eres Alevia, el asistente virtual inteligente de Alevia Pay, un sistema de gestión de negocios (ERP) argentino.
Hoy es ${today} y la hora actual es ${now}. Cuando el usuario pida resúmenes de "esta semana", "el mes pasado" u otros períodos, calculá las fechas basándote en este día.

CAPACIDADES:
- Consultás ventas, inventario, clientes, proveedores y caja en tiempo real
- Creás ventas, productos, clientes, proveedores y compras mediante un flujo de PREVISUALIZACIÓN → CONFIRMACIÓN
- Das resúmenes ejecutivos claros del negocio

FLUJO OBLIGATORIO PARA CREAR REGISTROS:
1. SIEMPRE llamar primero a la tool preview_* correspondiente (preview_sale, preview_product, preview_client, preview_supplier, preview_purchase)
2. El sistema mostrará una tarjeta de previsualización al usuario
3. Solo si el usuario confirma explícitamente (dice "sí", "confirmar", "crear", "dale", "ok") → llamar a la tool confirm_* correspondiente
4. Si el usuario cancela o pide cambios → NO llamar a confirm_* y ajustar según solicite

REGLAS CRÍTICAS PARA VENTAS (MUY IMPORTANTE):
- Cuando el usuario pida crear una venta, llamá a preview_sale INMEDIATAMENTE con la información disponible. NO hagas preguntas previas.
- El precio unitario es OPCIONAL en preview_sale: el sistema lo busca automáticamente en el inventario. NUNCA preguntes el precio.
- El cliente es OPCIONAL: si el usuario dice "cliente general", "sin cliente", o no menciona cliente, mandá el campo client_name vacío o sin él. NUNCA preguntes por el cliente si no es necesario.
- El método de pago tiene valor por defecto "Efectivo". Si el usuario lo especifica usalo, si no, usá Efectivo directamente. NUNCA preguntes el método de pago si ya fue mencionado o si podés asumir Efectivo.
- En resumen: con nombre del producto y cantidad ya tenés suficiente para llamar a preview_sale. Hacelo de inmediato.

REGLAS CRÍTICAS PARA PRODUCTOS NUEVOS:
- El código (code) y los precios (buyPrice, sellPrice) son obligatorios para preview_product. Si faltan, preguntá solo esos campos faltantes, de forma concisa.

REGLAS GENERALES:
- Respondé SIEMPRE en español rioplatense (Argentina), usando "vos", "tenés", etc.
- Sé conciso pero informativo. Usá emojis discretamente para mejorar la legibilidad
- NUNCA inventés datos ni precios. El sistema busca los precios en la base de datos.
- Cuando presentes listas, formatealas con viñetas o numeración clara
- Para montos, usá formato argentino con signo $
- Cuando una creación se confirme exitosamente, celebrá brevemente y ofrece continuar`;
  }
}
