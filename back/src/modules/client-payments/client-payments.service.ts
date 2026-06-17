import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientPayments } from './client-payments.schema';
import { Model } from 'mongoose';
import { ClientPaymentsDto } from './dto/client-payments.dto';
import { Clients } from '../clients/clients.schema';
import { Sales } from '../sales/sales.schema';
import { SalePaymentStatusEnum } from '../sales/enum/sales.enum';

@Injectable()
export class ClientPaymentsService {
  constructor(
    @InjectModel(ClientPayments.name)
    private clientPaymentsModel: Model<ClientPayments>,
    @InjectModel(Clients.name) private clientsModel: Model<Clients>,
    @InjectModel(Sales.name) private salesModel: Model<Sales>,
  ) {}

  //Crear pago de cliente
  async createPayment(body: ClientPaymentsDto) {
    const session = await this.clientPaymentsModel.db.startSession();
    session.startTransaction();
    try {
      const client = await this.clientsModel.findById(body.clientId).session(session);
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      if (client.debt <= 0) {
        throw new BadRequestException('El cliente no tiene deuda pendiente');
      }

      // Si se vincula a una venta, validar que exista y pertenezca al cliente
      let linkedSale: any = null;
      if (body.saleId) {
        linkedSale = await this.salesModel.findById(body.saleId).session(session);
        if (!linkedSale) {
          throw new NotFoundException('Venta no encontrada');
        }
        if (linkedSale.clientId?.toString() !== body.clientId) {
          throw new BadRequestException('La venta no pertenece a este cliente');
        }
      }

      const newPayment = await this.clientPaymentsModel.create(
        [{ ...body, date: new Date() }],
        { session },
      );

      client.debt -= newPayment[0].amount;
      if (client.debt < 0) client.debt = 0;
      await client.save({ session });

      // Si el pago está vinculado a una venta, marcarla como pagada
      if (linkedSale) {
        await this.salesModel.findByIdAndUpdate(
          body.saleId,
          { paymentStatus: SalePaymentStatusEnum.PAID },
          { session },
        );
      }

      await session.commitTransaction();
      return {
        success: true,
        message: 'Pago del cliente creado exitosamente',
        data: newPayment[0],
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Obtener todos los pagos de un cliente con paginación
  async getAllPaymentsByClient(
    clientId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      let pageNumber = parseInt(page.toString(), 10);
      let limitNumber = parseInt(limit.toString(), 10);
      const skip = (pageNumber - 1) * limitNumber;

      const payments = await this.clientPaymentsModel
        .find({ clientId })
        .skip(skip)
        .limit(limitNumber)
        .sort({createdAt: -1})
        .exec();

      const total = await this.clientPaymentsModel.countDocuments({ clientId });

      return {
        success: true,
        message: 'Pagos del cliente obtenidos exitosamente',
        data: {
          payments,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener pagos vinculados a una venta
  async getPaymentsBySale(saleId: string) {
    try {
      const payments = await this.clientPaymentsModel
        .find({ saleId })
        .sort({ createdAt: -1 })
        .exec();
      return {
        success: true,
        message: 'Pagos de la venta obtenidos exitosamente',
        data: payments,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener un pago por ID
  async getPaymentById(id: string) {
    try {
      const payment = await this.clientPaymentsModel.findById(id).exec();

      if (!payment) {
        return {
          success: false,
          message: 'Pago no encontrado',
        };
      }

      return {
        success: true,
        message: 'Pago obtenido exitosamente',
        data: payment,
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un pago
  async updatePayment(id: string, body: Partial<ClientPaymentsDto>) {
    try {
      const updatedPayment = await this.clientPaymentsModel
        .findByIdAndUpdate(id, body, { new: true })
        .exec();

      if (!updatedPayment) {
        return {
          success: false,
          message: 'No se pudo actualizar el pago',
        };
      }

      return {
        success: true,
        message: 'Pago actualizado exitosamente',
        data: updatedPayment,
      };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un pago
  async deletePayment(id: string) {
    try {
      const deletedPayment = await this.clientPaymentsModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedPayment) {
        return {
          success: false,
          message: 'No se pudo eliminar el pago',
        };
      }

      return {
        success: true,
        message: 'Pago eliminado exitosamente',
        data: deletedPayment,
      };
    } catch (error) {
      throw error;
    }
  }
}
