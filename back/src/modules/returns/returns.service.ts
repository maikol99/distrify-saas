import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sales } from '../sales/sales.schema';
import { Products } from '../products/products.schema';
import { Clients } from '../clients/clients.schema';
import { Returns } from './returns.schema';
import { ReturnType,RefundType } from './enum/returns.enum';
import { SaleStatusEnum, PaymentMethodsEnum } from '../sales/enum/sales.enum';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectModel(Returns.name) private returnsModel: Model<Returns>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Clients.name) private clientsModel: Model<Clients>,
  ) {}

  // DEVOLUCIÓN COMPLETA
  async processFullReturn(
    saleId: string,
    refundType: RefundType,
    reason: string,
    processedBy: string,
    notes?: string,
  ) {
    const session = await this.returnsModel.db.startSession();
    session.startTransaction();

    try {
      const sale: any = await this.salesModel.findById(saleId);

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatusEnum.CANCELLED) {
        throw new BadRequestException('La venta ya está cancelada');
      }

      if (sale.hasReturns) {
        throw new BadRequestException(
          'Esta venta ya tiene devoluciones procesadas',
        );
      }

      // Restaurar stock de todos los productos
      for (const product of sale.productDetails) {
        await this.productsModel.findByIdAndUpdate(
          product.productId,
          { $inc: { quantity: product.quantity } },
          { session },
        );

        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            await this.productsModel.findByIdAndUpdate(
              product.productId,
              {
                $inc: {
                  'sizesAndColors.$[variant].quantity': variant.quantity,
                },
              },
              {
                session,
                arrayFilters: [
                  {
                    'variant.size': variant.size,
                    'variant.color': variant.color,
                  },
                ],
              },
            );
          }
        }
      }

      // Manejar devolución según tipo
      let cashRefunded = 0;
      let creditGenerated = 0;

      if (refundType === RefundType.CASH) {
        cashRefunded = sale.total;
      } else if (refundType === RefundType.CREDIT) {
        creditGenerated = sale.total;
        // Aquí podrías crear un registro de crédito para el cliente
      } else if (refundType === RefundType.ACCOUNT_ADJUSTMENT) {
        // Ajustar cuenta corriente del cliente
        if (sale.clientId) {
          const client = await this.clientsModel.findById(sale.clientId);
          if (client) {
            // Si la venta fue a cuenta, reducir la deuda
            if (sale.paymentMethod === PaymentMethodsEnum.CUENTA) {
              client.debt = Math.max(0, client.debt - sale.total);
              await client.save({ session });
            }
          }
        }
      }

      // Transformar productos para incluir unitPrice (precio snapshot de la venta original)
      const returnedProducts = sale.productDetails.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: product.salePrice || 0,
        variants: product.variants || []
      }));

      // Crear registro de devolución
      const returnRecord = await this.returnsModel.create(
        [
          {
            originalSaleId: saleId,
            shopId: sale.shopId,
            clientId: sale.clientId,
            returnType: ReturnType.FULL_RETURN,
            returnedProducts: returnedProducts,
            returnedAmount: sale.total,
            newAmount: 0,
            balanceDifference: sale.total, // A favor del cliente
            refundType,
            cashRefunded,
            creditGenerated,
            reason,
            processedBy,
            notes,
          },
        ],
        { session },
      );

      // Actualizar venta original
      await this.salesModel.findByIdAndUpdate(
        saleId,
        {
          status: SaleStatusEnum.CANCELLED,
          hasReturns: true,
          cancelledAt: new Date(),
        },
        { session },
      );

      await session.commitTransaction();
      return {
        success: true,
        message: 'Devolución completa procesada correctamente',
        data: returnRecord[0],
        cashRefunded,
        creditGenerated,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // DEVOLUCIÓN PARCIAL
  async processPartialReturn(
    saleId: string,
    productsToReturn: any[],
    refundType: RefundType,
    reason: string,
    processedBy: string,
    notes?: string,
  ) {
    const session = await this.returnsModel.db.startSession();
    session.startTransaction();

    try {
      const sale: any = await this.salesModel.findById(saleId);

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatusEnum.CANCELLED) {
        throw new BadRequestException('La venta está cancelada');
      }

      let returnedAmount = 0;

      // Procesar cada producto a devolver
      for (const returnItem of productsToReturn) {
        const originalProduct = sale.productDetails.find(
          (p) => p.productId.toString() === returnItem.productId,
        );

        if (!originalProduct) {
          throw new BadRequestException(
            `Producto ${returnItem.productId} no encontrado en la venta`,
          );
        }

        // Restaurar stock
        await this.productsModel.findByIdAndUpdate(
          returnItem.productId,
          { $inc: { quantity: returnItem.quantity } },
          { session },
        );

        if (returnItem.variants && returnItem.variants.length > 0) {
          for (const variant of returnItem.variants) {
            await this.productsModel.findByIdAndUpdate(
              returnItem.productId,
              {
                $inc: {
                  'sizesAndColors.$[variant].quantity': variant.quantity,
                },
              },
              {
                session,
                arrayFilters: [
                  {
                    'variant.size': variant.size,
                    'variant.color': variant.color,
                  },
                ],
              },
            );
          }
        }

        // Calcular monto devuelto (necesitarías tener el precio unitario)
        returnedAmount += returnItem.unitPrice * returnItem.quantity;
      }

      let cashRefunded = 0;
      let creditGenerated = 0;

      if (refundType === RefundType.CASH) {
        cashRefunded = returnedAmount;
      } else if (refundType === RefundType.CREDIT) {
        creditGenerated = returnedAmount;
      }

      // Crear registro de devolución
      const returnRecord = await this.returnsModel.create(
        [
          {
            originalSaleId: saleId,
            shopId: sale.shopId,
            clientId: sale.clientId,
            returnType: ReturnType.PARTIAL_RETURN,
            returnedProducts: productsToReturn,
            returnedAmount,
            newAmount: 0,
            balanceDifference: returnedAmount,
            refundType,
            cashRefunded,
            creditGenerated,
            reason,
            processedBy,
            notes,
          },
        ],
        { session },
      );

      // Actualizar venta original
      await this.salesModel.findByIdAndUpdate(
        saleId,
        { hasReturns: true },
        { session },
      );

      await session.commitTransaction();
      return {
        success: true,
        message: 'Devolución parcial procesada correctamente',
        data: returnRecord[0],
        returnedAmount,
        cashRefunded,
        creditGenerated,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // CAMBIO DE PRODUCTOS
  async processExchange(
    saleId: string,
    productsToReturn: any[],
    newProducts: any[],
    reason: string,
    processedBy: string,
    cashier: string,
    notes?: string,
  ) {
    const session = await this.returnsModel.db.startSession();
    session.startTransaction();

    try {
      const sale: any = await this.salesModel.findById(saleId);

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatusEnum.CANCELLED) {
        throw new BadRequestException('La venta está cancelada');
      }

      let returnedAmount = 0;
      let newAmount = 0;

      // Restaurar stock de productos devueltos
      for (const returnItem of productsToReturn) {
        await this.productsModel.findByIdAndUpdate(
          returnItem.productId,
          { $inc: { quantity: returnItem.quantity } },
          { session },
        );

        if (returnItem.variants && returnItem.variants.length > 0) {
          for (const variant of returnItem.variants) {
            await this.productsModel.findByIdAndUpdate(
              returnItem.productId,
              {
                $inc: {
                  'sizesAndColors.$[variant].quantity': variant.quantity,
                },
              },
              {
                session,
                arrayFilters: [
                  {
                    'variant.size': variant.size,
                    'variant.color': variant.color,
                  },
                ],
              },
            );
          }
        }

        returnedAmount += returnItem.unitPrice * returnItem.quantity;
      }

      // Descontar stock de nuevos productos
      for (const newItem of newProducts) {
        await this.productsModel.findByIdAndUpdate(
          newItem.productId,
          { $inc: { quantity: -newItem.quantity } },
          { session },
        );

        if (newItem.variants && newItem.variants.length > 0) {
          for (const variant of newItem.variants) {
            await this.productsModel.findByIdAndUpdate(
              newItem.productId,
              {
                $inc: {
                  'sizesAndColors.$[variant].quantity': -variant.quantity,
                },
              },
              {
                session,
                arrayFilters: [
                  {
                    'variant.size': variant.size,
                    'variant.color': variant.color,
                  },
                ],
              },
            );
          }
        }

        newAmount += newItem.unitPrice * newItem.quantity;
      }

      const balanceDifference = returnedAmount - newAmount;

      let cashRefunded = 0;
      let creditGenerated = 0;
      let newSaleId = null;

      // Crear nueva venta para el cambio (con snapshot de nombre y precio)
      const enrichedNewProducts = await Promise.all(
        newProducts.map(async (p) => {
          const product = await this.productsModel.findById(p.productId).session(session);
          return {
            productId: p.productId,
            productName: product?.name || p.productName || '',
            salePrice: p.unitPrice ?? product?.sellPrice ?? 0,
            quantity: p.quantity,
            variants: p.variants || [],
          };
        }),
      );

      const newSale = await this.salesModel.create(
        [
          {
            shopId: sale.shopId,
            productDetails: enrichedNewProducts,
            clientId: sale.clientId,
            clientName: sale.clientName,
            subtotal: newAmount,
            total: Math.max(0, newAmount - returnedAmount),
            cashier,
            paymentMethod:
              balanceDifference > 0
                ? PaymentMethodsEnum.EFECTIVO
                : sale.paymentMethod,
            creationDate: new Date(),
            status: SaleStatusEnum.COMPLETED,
            originalSaleId: saleId,
            listName: 'Cambio de productos',
          },
        ],
        { session },
      );

      newSaleId = newSale[0]._id;

      // Gestionar diferencia de dinero
      if (balanceDifference > 0) {
        // A favor del cliente
        cashRefunded = balanceDifference;
      } else if (balanceDifference < 0) {
        // El cliente debe pagar la diferencia
        // Ya está reflejado en la nueva venta (total > 0)
      }

      // Crear registro de cambio
      const returnRecord = await this.returnsModel.create(
        [
          {
            originalSaleId: saleId,
            shopId: sale.shopId,
            clientId: sale.clientId,
            returnType: ReturnType.EXCHANGE,
            returnedProducts: productsToReturn,
            newProducts,
            returnedAmount,
            newAmount,
            balanceDifference,
            refundType: balanceDifference > 0 ? RefundType.CASH : null,
            cashRefunded,
            creditGenerated,
            newSaleId,
            reason,
            processedBy,
            notes,
          },
        ],
        { session },
      );

      // Actualizar venta original
      await this.salesModel.findByIdAndUpdate(
        saleId,
        {
          hasExchanges: true,
          relatedSaleId: newSaleId,
        },
        { session },
      );

      await session.commitTransaction();
      return {
        success: true,
        message: 'Cambio procesado correctamente',
        data: returnRecord[0],
        newSale: newSale[0],
        balanceDifference,
        cashRefunded,
        amountToPay: Math.abs(Math.min(0, balanceDifference)),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Obtener historial de devoluciones por venta
  async getReturnsBySale(saleId: string) {
    try {
      const returns = await this.returnsModel
        .find({ originalSaleId: saleId })
        .populate('returnedProducts.productId', 'name sellPrice')
        .populate('newProducts.productId', 'name sellPrice')
        .populate('newSaleId')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: returns,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las devoluciones de una tienda
  async getReturnsByShop(shopId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const returns = await this.returnsModel
        .find({ shopId })
        .populate('originalSaleId')
        .populate('clientId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.returnsModel.countDocuments({ shopId });

      return {
        success: true,
        data: returns,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
