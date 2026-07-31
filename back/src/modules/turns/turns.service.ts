import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sales } from 'src/modules/sales/sales.schema';
import { Inputs } from 'src/modules/inputs/inputs.schema';
import { Outputs } from 'src/modules/outputs/outputs.schema';
import { PaymentMethodsEnum, SaleStatusEnum } from '../sales/enum/sales.enum';
import { Turns } from 'src/modules/turns/turns.Schema';
import { CreateTurnDto, CloseTurnDto } from './dto/turns.dto';
import { TurnStatusEnum } from './enum/turns.enum';

/** Convierte una fecha string 'YYYY-MM-DD' al inicio del día en Argentina (UTC-3) */
function toArgentinaStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00-03:00`);
}

/** Convierte una fecha string 'YYYY-MM-DD' al final del día en Argentina (UTC-3) */
function toArgentinaEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999-03:00`);
}

@Injectable()
export class TurnsService {
  private readonly logger = new Logger(TurnsService.name);

  constructor(
    @InjectModel(Turns.name) private turnsModel: Model<Turns>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
    @InjectModel(Inputs.name) private inputsModel: Model<Inputs>,
    @InjectModel(Outputs.name) private outputsModel: Model<Outputs>,
  ) {}

  async openTurn(body: CreateTurnDto): Promise<Turns> {
    const { efectivoRecibido, descriptionApertura, userName, userId, shopId } = body;

    const existingOpenTurn = await this.turnsModel.findOne({
      userId,
      status: TurnStatusEnum.ABIERTO,
    });
    if (existingOpenTurn) {
      throw new BadRequestException('Ya tenés un turno abierto. Cerralo antes de abrir uno nuevo.');
    }

    const createdTurn = await this.turnsModel.create({
      descriptionApertura: descriptionApertura ?? '',
      efectivoRecibido: efectivoRecibido ?? 0,
      userName,
      userId,
      shopId: new Types.ObjectId(shopId),
      status: TurnStatusEnum.ABIERTO,
      horaApertura: new Date(),
    });

    return createdTurn;
  }

  async closeTurn(body: CloseTurnDto): Promise<Turns> {
    const { id, efectivoPresentado, descriptionCierre, userId } = body;

    const now = new Date();

    const previousTurn = await this.turnsModel.findOne({
      userId,
      status: TurnStatusEnum.ABIERTO,
    });

    if (!previousTurn) {
      throw new NotFoundException('No se encontró un turno abierto');
    }

    const startDate = previousTurn.horaApertura;
    const shopId = previousTurn.shopId.toString();

    // Ventas del turno: mismo shopId y userId, entre horaApertura y ahora
    const sales = await this.salesModel.find({
      shopId: previousTurn.shopId,
      userId: previousTurn.userId,
      createdAt: { $gte: startDate, $lte: now },
      status: { $ne: SaleStatusEnum.CANCELLED },
    });

    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalTarjeta = 0;
    let totalCuentaCorriente = 0;

    sales.forEach((sale) => {
      totalVentas += sale.total ?? 0;

      if (sale.paymentMethods && sale.paymentMethods.length > 0) {
        sale.paymentMethods.forEach((pm: any) => {
          const amount = pm.amount ?? 0;
          switch (pm.method) {
            case PaymentMethodsEnum.EFECTIVO:
              totalEfectivo += amount;
              break;
            case PaymentMethodsEnum.TRANSFERENCIA:
              totalTransferencia += amount;
              break;
            case PaymentMethodsEnum.CREDITO:
            case PaymentMethodsEnum.DEBITO:
              totalTarjeta += amount;
              break;
            case PaymentMethodsEnum.CUENTA:
              totalCuentaCorriente += amount;
              break;
          }
        });
      } else {
        const amount = sale.total ?? 0;
        switch (sale.paymentMethod) {
          case PaymentMethodsEnum.EFECTIVO:
            totalEfectivo += amount;
            break;
          case PaymentMethodsEnum.TRANSFERENCIA:
            totalTransferencia += amount;
            break;
          case PaymentMethodsEnum.CREDITO:
          case PaymentMethodsEnum.DEBITO:
            totalTarjeta += amount;
            break;
          case PaymentMethodsEnum.CUENTA:
            totalCuentaCorriente += amount;
            break;
        }
      }
    });

    // Ingresos del turno
    const inputs = await this.inputsModel.find({
      shopId,
      userId: previousTurn.userId,
      createdAt: { $gte: startDate, $lte: now },
    });
    const totalIngresos = inputs.reduce((sum, i) => sum + (i.total ?? 0), 0);

    // Egresos del turno
    const outputs = await this.outputsModel.find({
      shopId,
      userId: previousTurn.userId,
      createdAt: { $gte: startDate, $lte: now },
    });
    const totalEgresos = outputs.reduce((sum, o) => sum + (o.total ?? 0), 0);

    const efectivoPresentadoFinal = efectivoPresentado ?? 0;
    const efectivoRealSistema = totalEfectivo;
    const balancePresentadoReal = efectivoPresentadoFinal - efectivoRealSistema;

    const updatedTurn = await this.turnsModel.findByIdAndUpdate(
      id,
      {
        status: TurnStatusEnum.CERRADO,
        efectivoPresentado: efectivoPresentadoFinal,
        descriptionCierre: descriptionCierre ?? '',
        horaCierre: now,
        totalVentas,
        efectivoRealSistema,
        balancePresentadoReal,
        totalEfectivo,
        totalTransferencia,
        totalTarjeta,
        totalCuentaCorriente,
        totalIngresos,
        totalEgresos,
      },
      { new: true },
    );

    return updatedTurn;
  }

  /** Obtiene el preview de ventas para mostrar al cerrar turno */
  async getSalestoShow(userId: string): Promise<any> {
    const now = new Date();

    const previousTurn = await this.turnsModel.findOne({
      userId,
      status: TurnStatusEnum.ABIERTO,
    });

    if (!previousTurn) {
      throw new NotFoundException('No se encontró un turno abierto para este usuario');
    }

    const sales = await this.salesModel.find({
      shopId: previousTurn.shopId,
      userId: previousTurn.userId,
      createdAt: { $gte: previousTurn.horaApertura, $lte: now },
      status: { $ne: SaleStatusEnum.CANCELLED },
    });

    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalTarjeta = 0;
    let totalCuentaCorriente = 0;

    sales.forEach((sale) => {
      totalVentas += sale.total ?? 0;

      if (sale.paymentMethods && sale.paymentMethods.length > 0) {
        sale.paymentMethods.forEach((pm: any) => {
          const amount = pm.amount ?? 0;
          switch (pm.method) {
            case PaymentMethodsEnum.EFECTIVO:
              totalEfectivo += amount;
              break;
            case PaymentMethodsEnum.TRANSFERENCIA:
              totalTransferencia += amount;
              break;
            case PaymentMethodsEnum.CREDITO:
            case PaymentMethodsEnum.DEBITO:
              totalTarjeta += amount;
              break;
            case PaymentMethodsEnum.CUENTA:
              totalCuentaCorriente += amount;
              break;
          }
        });
      } else {
        const amount = sale.total ?? 0;
        switch (sale.paymentMethod) {
          case PaymentMethodsEnum.EFECTIVO:
            totalEfectivo += amount;
            break;
          case PaymentMethodsEnum.TRANSFERENCIA:
            totalTransferencia += amount;
            break;
          case PaymentMethodsEnum.CREDITO:
          case PaymentMethodsEnum.DEBITO:
            totalTarjeta += amount;
            break;
          case PaymentMethodsEnum.CUENTA:
            totalCuentaCorriente += amount;
            break;
        }
      }
    });

    return {
      totalVentas,
      totalEfectivo,
      totalTransferencia,
      totalTarjeta,
      totalCuentaCorriente,
      cantidadVentas: sales.length,
      horaApertura: previousTurn.horaApertura,
      turnId: previousTurn._id,
    };
  }

  async findAll(): Promise<Turns[]> {
    return this.turnsModel.find().sort({ horaApertura: -1 }).exec();
  }

  async getUserOpenTurn(userId: string): Promise<Turns | false> {
    const turn = await this.turnsModel
      .findOne({ userId, status: TurnStatusEnum.ABIERTO })
      .sort({ horaApertura: -1 });
    return turn ?? false;
  }

  /**
   * Devuelve los turnos del shop con filtros opcionales.
   * dateFrom y dateTo son strings 'YYYY-MM-DD' en hora argentina.
   * La conversión a UTC se hace aquí para que MongoDB filtre correctamente.
   */
  async getShopTurns(
    shopId: string,
    dateFrom?: string,
    dateTo?: string,
    userId?: string,
    status?: string,
    minSales?: number,
    maxSales?: number,
  ): Promise<{ turns: any[]; stats: any }> {
    const query: any = { shopId: new Types.ObjectId(shopId) };

    if (dateFrom || dateTo) {
      query.horaApertura = {};
      if (dateFrom) query.horaApertura.$gte = toArgentinaStartOfDay(dateFrom);
      if (dateTo)   query.horaApertura.$lte = toArgentinaEndOfDay(dateTo);
    }

    if (userId) {
      query.userId = userId;
    }

    if (status) query.status = status;
    if (minSales !== undefined || maxSales !== undefined) { query.totalVentas = {}; if (minSales !== undefined) query.totalVentas.$gte = minSales; if (maxSales !== undefined) query.totalVentas.$lte = maxSales; }

    const turns = await this.turnsModel
      .find(query)
      .sort({ horaApertura: -1 })
      .lean();

    const stats = {
      totalTurnos: turns.length,
      totalVentas: turns.reduce((s, t) => s + (t.totalVentas ?? 0), 0),
      totalEfectivo: turns.reduce((s, t) => s + (t.totalEfectivo ?? 0), 0),
      totalTransferencia: turns.reduce((s, t) => s + (t.totalTransferencia ?? 0), 0),
      totalTarjeta: turns.reduce((s, t) => s + (t.totalTarjeta ?? 0), 0),
      totalCuentaCorriente: turns.reduce((s, t) => s + (t.totalCuentaCorriente ?? 0), 0),
      totalIngresos: turns.reduce((s, t) => s + (t.totalIngresos ?? 0), 0),
      totalEgresos: turns.reduce((s, t) => s + (t.totalEgresos ?? 0), 0),
    };

    return { turns, stats };
  }

  async update(id: string, updateTurnDto: any): Promise<Turns> {
    const updatedTurn = await this.turnsModel
      .findByIdAndUpdate(id, updateTurnDto, { new: true })
      .exec();
    if (!updatedTurn) {
      throw new NotFoundException(`Turn with ID ${id} not found`);
    }
    return updatedTurn;
  }

  async remove(id: string): Promise<Turns> {
    const deletedTurn = await this.turnsModel.findByIdAndDelete(id).exec();
    if (!deletedTurn) {
      throw new NotFoundException(`Turn with ID ${id} not found`);
    }
    return deletedTurn;
  }
}
