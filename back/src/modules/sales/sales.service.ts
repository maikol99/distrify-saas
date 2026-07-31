import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sales } from 'src/modules/sales/sales.schema';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Products } from '../products/products.schema';
import { Clients } from '../clients/clients.schema';
import { CreateSaleDto } from './dto/sales.dto';
import { PaymentMethodsEnum, SalePaymentStatusEnum, SaleStatusEnum } from './enum/sales.enum';
import * as moment from 'moment-timezone';
@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Clients.name) private clientsModel: Model<Clients>,
  ) {}

  // CREAR VENTA NUEVA - Versión Mejorada
  async create(body: CreateSaleDto) {
    const session = await this.salesModel.db.startSession();
    session.startTransaction();
    try {
      // Enriquecer productDetails con snapshot de nombre y precio al momento de la venta
      const enrichedProductDetails = await Promise.all(
        (body.productDetails as any[]).map(async (item) => {
          if (item.isCombo) {
            return {
              ...item,
              productName: item.name || item.productName || 'Combo',
              salePrice: item.salePrice !== undefined ? item.salePrice : item.sellPrice || 0,
            };
          }

          const product = await this.productsModel
            .findById(item.productId)
            .session(session);
          if (!product) {
            throw new NotFoundException(
              `Producto ${item.productId} no encontrado`,
            );
          }
          let salePrice = product.sellPrice;
          if (body.listName && product.priceLists?.length) {
            const list = product.priceLists.find(
              (l: any) => l.listName === body.listName,
            );
            if (list) salePrice = list.price;
          } else if (!body.listName && product.priceLists?.length) {
            const sorted = [...product.priceLists].filter(l => l.minQuantity > 0 && l.minQuantity <= item.quantity).sort((a, b) => b.minQuantity - a.minQuantity);
            if (sorted.length > 0) {
              salePrice = sorted[0].price;
            }
          }
          return {
            ...item,
            productName: product.name,
            salePrice,
          };
        }),
      );

      // Determinar paymentStatus: pending si hay cuenta corriente, paid en cualquier otro caso
      const hasCuenta =
        body.paymentMethod === PaymentMethodsEnum.CUENTA ||
        (body.paymentMethods?.some(
          (m) => m.method === PaymentMethodsEnum.CUENTA,
        ) ?? false);
      const paymentStatus = hasCuenta
        ? SalePaymentStatusEnum.PENDING
        : SalePaymentStatusEnum.PAID;

      const saleBody = { ...body, productDetails: enrichedProductDetails, paymentStatus };
      const sale: any = await this.salesModel.create([saleBody], { session });
      if (!sale || sale.length === 0) {
        throw new InternalServerErrorException('No se pudo crear la venta');
      }

      // Procesar cada producto y sus variantes
      for (const product of enrichedProductDetails as any) {
        if (product.isCombo && product.comboProducts && product.comboProducts.length > 0) {
          for (const comboProductId of product.comboProducts) {
            await this.productsModel.findByIdAndUpdate(
              comboProductId,
              { $inc: { quantity: -product.quantity } },
              { session },
            );
          }
        } else if (!product.isCombo) {
          // Actualizar cantidad principal del producto
          await this.productsModel.findByIdAndUpdate(
            product.productId,
            { $inc: { quantity: -product.quantity } },
            { session },
          );

        // Si el producto tiene variantes, actualizarlas
        if (product.variants && product.variants.length > 0) {
          this.logger.log(
            'Actualizando variantes del producto:', product.productId,
          );

          for (const variant of product.variants) {
            await this.productsModel.findByIdAndUpdate(
              product.productId,
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
        } // close else if (!product.isCombo)
      } // close for

      if (body.clientId) {
        if (body.paymentMethod === PaymentMethodsEnum.CUENTA) {
          const client = await this.clientsModel.findById(body.clientId);
          if (!client) {
            throw new NotFoundException('Cliente no encontrado');
          }
          client.debt += body.total;
          await client.save({ session });
        } else if (body.paymentMethods && body.paymentMethods.length > 0) {
          const client = await this.clientsModel.findById(body.clientId);
          if (!client) {
            throw new NotFoundException('Cliente no encontrado');
          }
          for (const method of body.paymentMethods) {
            if (method.method === PaymentMethodsEnum.CUENTA) {
              client.debt += method.amount;
              await client.save({ session });
            }
          }
        }
      }

      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Venta creada correctamente',
        sale: sale[0],
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // TRAER TODAS LAS VENTAS
  async findAll(shopId: string, page?: number, limit?: number) {
    try {
      if (!page || !limit) {
        const sales = await this.salesModel.find({
          shopId: shopId,
        });
        if (!sales) {
          throw new NotFoundException();
        }

        return {
          success: true,
          message: 'Ventas encontradas',
          data: sales,
        };
      }

      let numberPage = Number(page);
      let numberLimit = Number(limit);
      const skip = (numberPage - 1) * numberLimit;

      const sales = await this.salesModel
        .find({
          shopId: shopId,
        })
        .populate({
          path: 'clientId',
          select: 'name _id',
        })
        .skip(skip)
        .limit(numberLimit)
        .sort({ createdAt: -1 });

      if (!sales) {
        throw new NotFoundException();
      }
      const total = await this.salesModel.countDocuments({
        shopId: shopId,
      });

      return {
        success: true,
        message: 'Ventas encontradas',
        data: sales,
        pagination: {
          total: total,
          page: numberPage,
          limit: numberLimit,
          totalPages: Math.ceil(total / numberLimit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching sales');
    }
  }

  // TRAER VETNA POR ID
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const sale = await this.salesModel.findById(id);

      if (!sale) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Venta encontrada',
        data: sale,
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw error;
    }
  }

  // ACTUALIZAR UNA VENTA
  async update(id: string, body) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const sale = await this.salesModel.findByIdAndUpdate({ _id: id }, body);

      if (!sale) {
        throw new NotFoundException();
      }

      return {
        success: true,
        message: 'Venta actualizada',
        data: sale,
      };
    } catch (error) {
      if (error.kind === 'ObjectId') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Error updating sale');
    }
  }

  // ELIMINAR UNA VENTA
  async remove(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }
      const sale = await this.salesModel.findByIdAndDelete(id);

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }
      return {
        success: true,
        message: 'Venta eliminada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  // Servicio para filtrar total ventas por fecha
  async filterSales(shopId: string, startDate: Date, endDate: Date) {
    try {
      if (!shopId) {
        throw new BadRequestException('ID de tienda es requerido');
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas');
      }

      const start = moment
        .tz(startDate, 'America/Argentina/Buenos_Aires')
        .startOf('day')
        .toDate();
      const end = moment
        .tz(endDate, 'America/Argentina/Buenos_Aires')
        .endOf('day')
        .toDate();

      const sales = await this.salesModel.find({
        shopId: shopId,
        creationDate: {
          $gte: start,
          $lte: end,
        },
      });

      if (sales.length === 0) {
        throw new NotFoundException(
          'No se encontraron ventas en este rango de fechas',
        );
      }

      let total = 0;
      for (const item of sales) {
        total = total + item.total;
      }
      return {
        success: true,
        message: 'Ventas encontradas',
        data: sales,
        total: total,
      };
    } catch (error) {
      throw new Error(`Error al filtrar ventas: ${error.message}`);
    }
  }

  //Obtener productos de las ventas
  async getSalesProducts(shopId: string, startDate, endDate) {
    try {
      if (!shopId) {
        throw new BadRequestException('ID de tienda es requerido');
      }

      const start = moment
        .tz(startDate, 'America/Argentina/Buenos_Aires')
        .startOf('day')
        .toDate();
      const end = moment
        .tz(endDate, 'America/Argentina/Buenos_Aires')
        .endOf('day')
        .toDate();

      const sales = await this.salesModel.find({
        shopId: shopId,
        createdAt: {
          $gte: start,
          $lte: end,
        },
      });
      if (sales.length === 0) {
        throw new NotFoundException(
          'No se encontraron ventas en este rango de fechas',
        );
      }

      return {
        success: true,
        message: 'Ventas encontradas',
        data: sales,
      };
    } catch (error) {
      this.logger.error('Error retrieving sales products:', error);
      throw new Error('Error retrieving sales products');
    }
  }

  //Anular una venta
  async cancelSale(saleId: string) {
    const session = await this.salesModel.db.startSession();
    session.startTransaction();
    try {
      if (!saleId) {
        throw new BadRequestException('ID de venta es requerido');
      }

      const sale: any = await this.salesModel.findById(saleId);

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatusEnum.CANCELLED) {
        throw new BadRequestException('La venta ya fue anulada');
      }

      // Revertir deuda del cliente si existe
      if (sale.clientId) {
        const client = await this.clientsModel.findOne({
          _id: sale.clientId,
        });

        if (client) {
          if (sale.paymentMethod === PaymentMethodsEnum.CUENTA) {
            if (client.debt < sale.total) {
              return {
                success: false,
                message:
                  'La deuda del cliente es insuficiente para anular esta venta',
              };
            }
            client.debt -= sale.total;
            await client.save({ session });
          } else if (sale.paymentMethods && sale.paymentMethods.length > 0) {
            for (const method of sale.paymentMethods) {
              if (method.method === PaymentMethodsEnum.CUENTA) {
                client.debt -= method.amount;
                await client.save({ session });
              }
            }
          }
        }
      }

      const productsRestored = [];

      // Procesar productos y variantes
      for (const product of sale.productDetails) {
        const { productId, quantity, variants, isCombo, comboProducts } = product;

        if (isCombo && comboProducts && comboProducts.length > 0) {
          for (const comboProductId of comboProducts) {
            await this.productsModel.findByIdAndUpdate(
              comboProductId,
              { $inc: { quantity } },
              { session },
            );
          }
        } else if (!isCombo) {
          // Restaurar stock principal
          await this.productsModel.findByIdAndUpdate(
            productId,
            {
              $inc: { quantity },
            },
            { session },
          );

        // Restaurar variantes si existen
        if (variants && variants.length > 0) {
          for (const variant of variants) {
            await this.productsModel.findByIdAndUpdate(
              productId,
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
        } // close else if (!isCombo)

        productsRestored.push({
          productId,
          quantity,
          restoredVariants: variants || [],
        });
      }

      // Cambiar estado de la venta
      await this.salesModel.findByIdAndUpdate(
        saleId,
        {
          status: SaleStatusEnum.CANCELLED,
          cancelledAt: new Date(),
        },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Venta anulada correctamente',
        productsRestored,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  //Funcion para cambio de prenda de una venta
  async changeSaleItem(
    saleId: string,
    oldProductId: string,
    newProductId: string,
  ) {
    try {
      const sale = await this.salesModel.findById(saleId);
      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }
      return sale;
    } catch (error) {
      throw error;
    }
  }

  //Obtener ventas por cliente
  async getSalesByClient(
    clientId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      if (!clientId) {
        throw new BadRequestException('ID de cliente es requerido');
      }

      const skip = (page - 1) * limit;
      const sales = await this.salesModel
        .find({ clientId: clientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await this.salesModel.countDocuments({
        clientId: clientId,
      });

      return {
        success: true,
        message: 'Ventas encontradas',
        data: sales,
        pagination: {
          total: total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener ventas con filtrado complejo
  async getSalesWithFilter(
    shopId: string,
    startDate: Date,
    endDate: Date,
    clientId: string,
    cashier: string,
    paymentMethod: string,
    status: SaleStatusEnum,
    page: number,
    limit: number,
    minAmount?: number,
    maxAmount?: number,
    productId?: string,
    hasDiscount?: string,
    saleId?: string,
  ) {
    try {
      const query: any = {
        shopId: shopId,
      };
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        this.logger.log(`start: ${start}`);
        this.logger.log(`end: ${end}`);

        end.setHours(23, 59, 59, 999);
        query.createdAt = {
          $gte: start,
          $lte: end,
        };
      }

      if (clientId) {
        query.clientId = clientId;
      }
      if (cashier) {
        query.cashier = cashier;
      }
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }
      if (status) {
        query.status = status;
      }
      if (minAmount !== undefined || maxAmount !== undefined) {
        query.total = {};
        if (minAmount !== undefined) query.total.$gte = minAmount;
        if (maxAmount !== undefined) query.total.$lte = maxAmount;
      }
      if (productId) {
        query['productDetails.productId'] = productId;
      }
      if (hasDiscount === 'true') {
        query.discount = { $gt: 0 };
      } else if (hasDiscount === 'false') {
        query.discount = { $lte: 0 };
      }
      if (saleId) {
        query._id = saleId;
      }

      let limitNumber = Number(limit) || 10;
      let pageNumber = Number(page) || 1;

      const skip = (pageNumber - 1) * limit;

      this.logger.log(`Filter query:`, query);

      const sales = await this.salesModel
        .find(query)
        .skip(skip)
        .populate({
          path: 'clientId',
          select: 'name _id',
        })
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      if (sales.length === 0) {
        return {
          success: false,
          message: 'No se encontraron ventas con los filtros aplicados',
        };
      }
      const total = await this.salesModel.countDocuments(query);

      return {
        success: true,
        message: 'Ventas encontradas',
        data: sales,
        pagination: {
          total: total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
