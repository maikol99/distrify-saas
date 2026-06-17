import { Injectable, Inject, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Caja } from 'src/modules/caja/caja.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCajaDto } from './dto/caja.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sales } from '../sales/sales.schema';
import { Outputs } from '../outputs/outputs.schema';
import { Buys } from '../buys/buys.schema';
import { Inputs } from '../inputs/inputs.schema';
import * as moment from 'moment-timezone';
import { ShopsService } from '../shops/shops.service';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class CajaService {
  private readonly logger = new Logger(CajaService.name);

  constructor(
    @InjectModel(Caja.name) private cajaModel: Model<Caja>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Outputs.name) private outputsModel: Model<Outputs>,
    @InjectModel(Buys.name) private buysModel: Model<Buys>,
    @InjectModel(Inputs.name) private inputsModel: Model<Inputs>,
    private shopsService: ShopsService,
    private emailService: EmailsService,
  ) {}

  //Abrir caja (se realiza al iniciar el negocio por un usuario)
  async openCaja(body: CreateCajaDto) {
    try {
      const fechaApertura = new Date();

      const existingCaja = await this.cajaModel.findOne({
        shopId: body.shopId,
        estado: 'abierta',
      });
      if (existingCaja) {
        return {
          success: false,
          message: 'Ya hay una caja abierta para este negocio',
        };
      }

      body.fechaApertura = fechaApertura;

      const newCaja = await this.cajaModel.create(body);
      if (!newCaja) {
        return {
          success: false,
          message: 'Error al abrir la caja',
        };
      }
      return {
        success: true,
        message: 'Caja abierta correctamente',
        data: newCaja,
      };
    } catch (error) {
      throw error;
    }
  }

  //Cerrar caja (se realiza al finalizar el dia por un usuario)
  mapToSchemaFields(
    paymentMap: Record<string, number>,
  ): Record<string, number> {
    return {
      totalEfectivo: paymentMap['Efectivo'] || paymentMap['efectivo'] || 0,
      totalTarjeta:
        (paymentMap['Debito'] || 0) +
        (paymentMap['Credito'] || 0) +
        (paymentMap['tarjeta'] || 0), // si ya viene agrupado
      totalCheque: paymentMap['Cheque'] || 0,
      totalTransferencia: paymentMap['Transferencia'] || 0,
      totalCuentaCorriente:
        paymentMap['Cuenta corriente'] || paymentMap['cuenta_corriente'] || 0,
    };
  }
  async closeCaja(body: any) {
    try {
      const { shopId, userIdCierre, observaciones, entregaEfectivoFinal } =
        body;

      if (!shopId) {
        throw new Error('shopId is required');
      }
      const openCaja = await this.cajaModel.findOne({
        shopId: shopId,
        estado: 'abierta',
      });
      if (!openCaja) {
        return {
          success: false,
          message: 'No hay una caja abierta para cerrar',
        };
      }

      const fechaCierre = new Date();

      const sales = await this.salesModel
        .find({
          shopId: shopId,
          status: 'Completado',

          createdAt: {
            $gte: openCaja.fechaApertura,
            $lte: fechaCierre,
          },
        })
        .select('total paymentMethod');

      const outputs = await this.outputsModel
        .find({
          shopId: shopId,
          createdAt: {
            $gte: openCaja.fechaApertura,
            $lte: fechaCierre,
          },
        })
        .select('total paymentMethod');

      const buys = await this.buysModel
        .find({
          shopId: shopId,
          createdAt: {
            $gte: openCaja.fechaApertura,
            $lte: fechaCierre,
          },
        })
        .select('total paymentMethod');

      const inputs = await this.inputsModel.find({
        shopId: shopId,
        createdAt: {
          $gte: openCaja.fechaApertura,
          $lte: fechaCierre,
        },
      });

      //Obtener totales sin importar medio de pago
      const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
      const totalOutputs = outputs.reduce(
        (acc, output) => acc + output.total,
        0,
      );
      const totalBuys = buys.reduce((acc, buy) => acc + buy.total, 0);

      const totalInputs = inputs.reduce((acc, input) => acc + input.total, 0);

      //Obtener totales por medio de pago

      const totalSalesByPaymentMethod: any = sales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      }, {});

      const totalOutputsByPaymentMethod = outputs.reduce((acc, output) => {
        acc[output.paymentMethod] =
          (acc[output.paymentMethod] || 0) + output.total;
        return acc;
      }, {});

      const totalBuysByPaymentMethod = buys.reduce((acc, buy) => {
        acc[buy.paymentMethod] = (acc[buy.paymentMethod] || 0) + buy.total;
        return acc;
      }, {});

      const totalInputsByPaymentMethod: any = inputs.reduce((acc, input) => {
        acc[input.paymentMethod] =
          (acc[input.paymentMethod] || 0) + input.total;
        return acc;
      }, {});

      const inputsMovements = inputs.reduce((acc, input) => {
        acc.push({
          type: 'ingreso',
          total: input.total,
          paymentMethod: input.paymentMethod,
        });
        return acc;
      }, []);
      const outputsMovements = outputs.reduce((acc, output) => {
        acc.push({
          type: 'egreso',
          total: output.total,
          paymentMethod: output.paymentMethod,
        });
        return acc;
      }, []);

      const movements = [...inputsMovements, ...outputsMovements];

      let data: any = {
        totalCaja: {
          totalVentas: totalSales,
          totalCompras: totalBuys,
          totalGastos: totalOutputs,
          totalIngresos: totalInputs,
        },
        totalVentas: this.mapToSchemaFields(totalSalesByPaymentMethod),
        totalCompras: this.mapToSchemaFields(totalBuysByPaymentMethod),
        totalGastos: this.mapToSchemaFields(totalOutputsByPaymentMethod),
        totalIngresos: this.mapToSchemaFields(totalInputsByPaymentMethod),
        fechaApertura: openCaja.fechaApertura,
        fechaCierre: fechaCierre,
        movimientos: movements,
        userIdCierre: userIdCierre,
        observaciones: observaciones,
        entregasEfectivo: {
          inicial: openCaja.entregasEfectivo?.inicial || 0,
          final: entregaEfectivoFinal,
        },

        estado: 'cerrada',
        arqueoFinal: {
          balanceFinal: totalSales + totalInputs - totalOutputs - totalBuys,
          efectivoTotalSistema:
            (totalSalesByPaymentMethod.Efectivo || 0) +
            (totalInputsByPaymentMethod.Efectivo || 0),
          efectivoTotalPresentado: entregaEfectivoFinal,
        },
        actualizadoEn: new Date(),
      };

      const updatedCaja = await this.cajaModel.findByIdAndUpdate(
        openCaja._id,
        data,
        { new: true },
      );

      if (!updatedCaja) {
        return {
          success: false,
          message: 'Error al cerrar la caja',
        };
      }

      return {
        success: true,
        message: 'Caja cerrada correctamente',
        data: updatedCaja,
      };
    } catch (error) {
      throw error;
    }
  }

  //Registrar movimiento de caja
  async registerMovement(body: any) {
    try {
      let movementObject: any = {
        tipo: body.tipo,
        descripcion: body.descripcion,
        metodo: body.metodo,
        monto: body.monto,
        fecha: new Date(),
        referenciaId: body.referenciaId,
        userId: body.usuarioId,
      };

      if (!body.shopId) {
        throw new Error('shopId is required');
      }
      const caja = await this.cajaModel.findOne({
        shopId: body.shopId,
        estado: 'abierta',
      });
      if (!caja) {
        throw new Error('No hay una caja abierta para registrar el movimiento');
      }

      caja.movimientos.push(movementObject);

      if (caja.totalCaja === undefined) {
        caja.totalCaja = {
          totalVentas: 0,
          totalCompras: 0,
          totalGastos: 0,
          totalIngresos: 0,
        };
      }

      caja.totalCaja.totalVentas += body.tipo === 'venta' ? body.monto : 0;

      caja.totalCaja.totalCompras += body.tipo === 'compra' ? body.monto : 0;

      caja.totalCaja.totalGastos += body.tipo === 'egreso' ? body.monto : 0;

      caja.totalCaja.totalIngresos += body.tipo === 'ingreso' ? body.monto : 0;
      await caja.save();

      return {
        success: true,
        message: 'Movimiento registrado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  //Traer todas las cajas de un negocio con paginación
  async findAll(shopId: string, page: number, limit: number) {
    try {
      if (!shopId) {
        throw new Error('shopId is required');
      }

      let pageNumber = Number(page);
      let limitNumber = Number(limit);

      const skip = (pageNumber - 1) * limitNumber;
      const cajas = await this.cajaModel
        .find({ shopId: shopId })
        .skip(skip)

        .select(
          '_id estado fechaApertura totalCaja arqueoFinal title entregasEfectivo',
        )
        .limit(limitNumber)
        .sort({ fechaApertura: -1 });

      if (cajas.length === 0) {
        throw new Error('No hay cajas para esta tienda');
      }

      return {
        success: true,
        message: 'Cajas encontradas correctamente',
        data: cajas,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: cajas.length,
          totalPages: Math.ceil(cajas.length / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener caja y obtener su resumen
  async getCajaSummary(cajaId: string) {
    try {
      const caja = await (
        await this.cajaModel.findById(cajaId)
      ).populate({
        path: 'userIdApertura userIdCierre',
        select: 'username email',
      });
      if (!caja) {
        throw new Error('Caja no encontrada');
      }

      const fechaActual = new Date();

      const sales = await this.salesModel
        .find({
          shopId: caja.shopId,
          status: 'Completado',
          createdAt: {
            $gte: caja.fechaApertura,
            $lte: fechaActual,
          },
        })
        .select('total paymentMethod');

      const outputs = await this.outputsModel
        .find({
          shopId: caja.shopId,
          createdAt: {
            $gte: caja.fechaApertura,
            $lte: fechaActual,
          },
        })
        .select('total paymentMethod');

      const buys = await this.buysModel
        .find({
          shopId: caja.shopId,
          createdAt: {
            $gte: caja.fechaApertura,
            $lte: fechaActual,
          },
        })
        .select('total paymentMethod');

      const inputs = await this.inputsModel.find({
        shopId: caja.shopId,
        createdAt: {
          $gte: caja.fechaApertura,
          $lte: fechaActual,
        },
      });

      const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
      const totalOutputs = outputs.reduce((acc, out) => acc + out.total, 0);
      const totalBuys = buys.reduce((acc, buy) => acc + buy.total, 0);
      const totalInputs = inputs.reduce((acc, input) => acc + input.total, 0);

      const totalSalesByPaymentMethod = sales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      }, {});

      const totalOutputsByPaymentMethod = outputs.reduce((acc, output) => {
        acc[output.paymentMethod] =
          (acc[output.paymentMethod] || 0) + output.total;
        return acc;
      }, {});

      const totalBuysByPaymentMethod = buys.reduce((acc, buy) => {
        acc[buy.paymentMethod] = (acc[buy.paymentMethod] || 0) + buy.total;
        return acc;
      }, {});

      const totalInputsByPaymentMethod = inputs.reduce((acc, input) => {
        acc[input.paymentMethod] =
          (acc[input.paymentMethod] || 0) + input.total;
        return acc;
      }, {});

      const inputsMovements = inputs.reduce((acc, input) => {
        acc.push({
          type: 'ingreso',
          total: input.total,
          paymentMethod: input.paymentMethod,
        });
        return acc;
      }, []);

      const outputsMovements = outputs.reduce((acc, output) => {
        acc.push({
          type: 'egreso',
          total: output.total,
          paymentMethod: output.paymentMethod,
        });
        return acc;
      }, []);

      const movements = [...inputsMovements, ...outputsMovements];

      const resumen = {
        totalCaja: {
          totalVentas: totalSales,
          totalCompras: totalBuys,
          totalGastos: totalOutputs,
          totalIngresos: totalInputs,
        },
        totalVentas: this.mapToSchemaFields(totalSalesByPaymentMethod),
        totalCompras: this.mapToSchemaFields(totalBuysByPaymentMethod),
        totalGastos: this.mapToSchemaFields(totalOutputsByPaymentMethod),
        totalIngresos: this.mapToSchemaFields(totalInputsByPaymentMethod),
        fechaApertura: caja.fechaApertura,
        fechaCierre: caja.fechaCierre || null,
        fechaActual: fechaActual,
        movimientos: movements,
        arqueoFinal: {
          balanceFinal: totalSales + totalInputs - totalOutputs - totalBuys,
          efectivoTotalSistema:
            (totalSalesByPaymentMethod['Efectivo'] || 0) +
            (totalInputsByPaymentMethod['Efectivo'] || 0),
          efectivoTotalPresentado: caja.entregasEfectivo.final,
        },
        userIdApertura: caja.userIdApertura,
        userIdCierre: caja.userIdCierre,
        observaciones: caja.observaciones,
        entregasEfectivo: caja.entregasEfectivo,
        estado: caja.estado,
        title: caja.title,
        _id: caja._id,
      };

      return {
        success: true,
        message: 'Resumen de caja generado correctamente',
        data: resumen,
      };
    } catch (error) {
      throw error;
    }
  }

  //Filtrar cajas segun filtros
  async filterCajas(
    shopId: string,
    title: string,
    estado: string,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    createdBy?: string,
    minAmount?: number,
    maxAmount?: number,
    isAutomatic?: string,
  ) {
    try {
      let pageNumber = Number(page);
      let limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const query: any = { shopId: shopId };

      if (title) {
        query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
      }
      if (estado) {
        query.estado = estado;
      }
      if (startDate && endDate) {
        const start = moment
          .tz(startDate, 'America/Argentina/Buenos_Aires')
          .startOf('day')
          .toDate();
        const end = moment
          .tz(endDate, 'America/Argentina/Buenos_Aires')
          .endOf('day')
          .toDate();
        query.fechaApertura = {
          $gte: start,
          $lte: end,
        };
      }
      if (createdBy) {
        query.userIdApertura = createdBy;
      }
      if (isAutomatic !== undefined && isAutomatic !== '') {
        if (isAutomatic === 'true') {
          query.title = 'Apertura automática';
        } else {
          query.title = { $ne: 'Apertura automática' };
        }
      }
      if (minAmount !== undefined || maxAmount !== undefined) {
        query['totalCaja.totalVentas'] = {};
        if (minAmount !== undefined) query['totalCaja.totalVentas'].$gte = minAmount;
        if (maxAmount !== undefined) query['totalCaja.totalVentas'].$lte = maxAmount;
      }

      const total = await this.cajaModel.countDocuments(query);

      const cajas = await this.cajaModel
        .find(query)
        .skip(skip)
        .limit(limitNumber)
        .sort({ fechaApertura: -1 })

        .select(
          '_id estado fechaApertura totalCaja arqueoFinal title entregasEfectivo userIdApertura',
        );

      if (cajas.length === 0) {
        return {
          success: false,
          message: 'No se encontraron cajas con los filtros aplicados',
        };
      }

      return {
        success: true,
        message: 'Cajas filtradas correctamente',
        data: cajas,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: total,
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //ELiminar caja (solo si esta cerrada)
  async deleteCaja(cajaId: string) {
    try {
      const caja = await this.cajaModel.findById(cajaId);
      if (!caja) {
        return {
          success: false,
          message: 'Caja no encontrada',
        };
      }
      if (caja.estado !== 'cerrada') {
        return {
          success: false,
          message: 'Solo se pueden eliminar cajas cerradas',
        };
      }
      await this.cajaModel.deleteOne({ _id: cajaId });
      return {
        success: true,
        message: 'Caja eliminada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  //Cron diario para abrir caja automáticamente a las 00:00 Argentina
  @Cron('0 0 * * *')
  async autoOpenCaja() {
    try {
      this.logger.log('Iniciando apertura automática de cajas...');

      const shopsResult = await this.shopsService.getAllShops(1, 99999);
      const shops = shopsResult.data || [];
      let opened = 0;

      for (const shop of shops) {
        const shopId = shop._id ? shop._id.toString() : shop.id?.toString();
        if (!shopId) continue;

        const existingCaja = await this.cajaModel.findOne({
          shopId,
          estado: 'abierta',
        });

        if (!existingCaja) {
          await this.cajaModel.create({
            shopId,
            userIdApertura: shop._id,
            title: 'Apertura automática',
            fechaApertura: moment.tz('America/Argentina/Buenos_Aires').toDate(),
            estado: 'abierta',
            entregasEfectivo: { inicial: 0 },
          });
          opened++;
        }
      }

      this.logger.log(`Apertura automática completada. ${opened} cajas abiertas.`);
    } catch (error) {
      this.logger.error('Error en apertura automática de cajas:', error);
    }
  }

  //Cron diario para cerrar caja a las 23:59 Argentina
  @Cron('59 23 * * *')
  async autoCloseCaja() {
    try {
      this.logger.log('Iniciando cierre automático de cajas...');

      const shopsResult = await this.shopsService.getAllShops(1, 99999);
      const shops = shopsResult.data || [];
      let closed = 0;

      for (const shop of shops) {
        const shopId = shop._id ? shop._id.toString() : shop.id?.toString();
        if (!shopId) continue;

        const openCaja = await this.cajaModel.findOne({
          shopId,
          estado: 'abierta',
        });

        if (!openCaja) continue;

        const fechaCierre = moment.tz('America/Argentina/Buenos_Aires').toDate();

        const sales = await this.salesModel
          .find({
            shopId,
            status: 'Completado',
            createdAt: { $gte: openCaja.fechaApertura, $lte: fechaCierre },
          })
          .select('total paymentMethod');

        const outputs = await this.outputsModel
          .find({
            shopId,
            createdAt: { $gte: openCaja.fechaApertura, $lte: fechaCierre },
          })
          .select('total paymentMethod');

        const buys = await this.buysModel
          .find({
            shopId,
            createdAt: { $gte: openCaja.fechaApertura, $lte: fechaCierre },
          })
          .select('total paymentMethod');

        const inputs = await this.inputsModel
          .find({
            shopId,
            createdAt: { $gte: openCaja.fechaApertura, $lte: fechaCierre },
          })
          .select('total paymentMethod');

        const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
        const totalOutputs = outputs.reduce((acc, output) => acc + output.total, 0);
        const totalBuys = buys.reduce((acc, buy) => acc + buy.total, 0);
        const totalInputs = inputs.reduce((acc, input) => acc + input.total, 0);

        const totalSalesByPaymentMethod: any = sales.reduce((acc, sale) => {
          acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
          return acc;
        }, {});

        const totalOutputsByPaymentMethod = outputs.reduce((acc, output) => {
          acc[output.paymentMethod] = (acc[output.paymentMethod] || 0) + output.total;
          return acc;
        }, {});

        const totalBuysByPaymentMethod = buys.reduce((acc, buy) => {
          acc[buy.paymentMethod] = (acc[buy.paymentMethod] || 0) + buy.total;
          return acc;
        }, {});

        const totalInputsByPaymentMethod: any = inputs.reduce((acc, input) => {
          acc[input.paymentMethod] = (acc[input.paymentMethod] || 0) + input.total;
          return acc;
        }, {});

        const updateData: any = {
          fechaCierre,
          estado: 'cerrada',
          userIdCierre: openCaja.userIdApertura,
          totalCaja: {
            totalVentas: totalSales,
            totalCompras: totalBuys,
            totalGastos: totalOutputs,
            totalIngresos: totalInputs,
          },
          totalVentas: this.mapToSchemaFields(totalSalesByPaymentMethod),
          totalCompras: this.mapToSchemaFields(totalBuysByPaymentMethod),
          totalGastos: this.mapToSchemaFields(totalOutputsByPaymentMethod),
          totalIngresos: this.mapToSchemaFields(totalInputsByPaymentMethod),
          arqueoFinal: {
            balanceFinal: totalSales + totalInputs - totalOutputs - totalBuys,
            efectivoTotalSistema:
              (totalSalesByPaymentMethod.Efectivo || 0) +
              (totalInputsByPaymentMethod.Efectivo || 0),
            efectivoTotalPresentado:
              (totalSalesByPaymentMethod.Efectivo || 0) +
              (totalInputsByPaymentMethod.Efectivo || 0),
          },
          actualizadoEn: new Date(),
        };

        await this.cajaModel.findByIdAndUpdate(openCaja._id, updateData);
        closed++;

        const reportData = {
          totals: { sales: totalSales, purchases: totalBuys, expenses: totalOutputs, incomes: totalInputs },
          salesByPaymentMethodTotals: this.mapToSchemaFields(totalSalesByPaymentMethod),
          purchasesByPaymentMethodTotals: this.mapToSchemaFields(totalBuysByPaymentMethod),
          expensesByPaymentMethodTotals: this.mapToSchemaFields(totalOutputsByPaymentMethod),
          incomesByPaymentMethodTotals: this.mapToSchemaFields(totalInputsByPaymentMethod),
        };

        const shopData = await this.shopsService.getShopById(shopId);
        const email = shopData?.data?.email;
        if (email) {
          await this.emailService.sendDailyBusinessSummary(email, reportData, new Date());
        }
      }

      this.logger.log(`Cierre automático completado. ${closed} cajas cerradas.`);
    } catch (error) {
      this.logger.error('Error en cierre automático de cajas:', error);
    }
  }
}
