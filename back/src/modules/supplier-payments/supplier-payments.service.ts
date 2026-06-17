import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SupplierPayments } from './supplier-payments.schema';
import { Model } from 'mongoose';
import { SupplierPaymentsDto } from './dto/supplier-payments.dto';
import { Suppliers } from '../suppliers/supplier.schema';

@Injectable()
export class SupplierPaymentsService {
  constructor(
    @InjectModel(SupplierPayments.name)private supplierPaymentsModel: Model<SupplierPayments>,
    @InjectModel(Suppliers.name) private suppliersModel: Model<Suppliers>,
  ) {}

  //Crear pago de proveedor
  async createPayment(body: SupplierPaymentsDto) {
    try {
      const supplier = await this.suppliersModel.findById(body.supplierId);
      if (!supplier) {
        return {
          success: false,
          message: 'Proveedor no encontrado',
        };
      }

      if (supplier.debt <= 0) {
        return {
          success: false,
          message: 'El proveedor no tiene deuda pendiente',
        };
      }

      const newPayment = await this.supplierPaymentsModel.create({
        ...body,
        date: new Date(),
      });
      if (!newPayment) {
        return {
          success: false,
          message: 'Error creando el pago del cliente',
        };
      }

      

      supplier.debt -= newPayment.amount;
      await supplier.save();

      return {
        success: true,
        message: 'Pago del proveedor creado exitosamente',
        data: newPayment,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los pagos de un proveedor con paginación
  async getAllPaymentsBySupplier(
    supplierId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      let pageNumber = Number(page);
      let limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const payments = await this.supplierPaymentsModel
        .find({ supplierId: supplierId })
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })
        .exec();

      const total = await this.supplierPaymentsModel.countDocuments({ supplierId });

      return {
        success: true,
        message: 'Pagos del proveedor obtenidos exitosamente',
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

  // Obtener un pago por ID
  async getPaymentById(id: string) {
    try {
      const payment = await this.supplierPaymentsModel.findById(id).exec();

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
  async updatePayment(id: string, body: Partial<SupplierPaymentsDto>) {
    try {
      const updatedPayment = await this.supplierPaymentsModel
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
      const deletedPayment = await this.supplierPaymentsModel
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
