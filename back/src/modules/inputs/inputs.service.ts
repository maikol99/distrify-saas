import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Inputs } from './inputs.schema';
import { Model } from 'mongoose';
import { CreateInputDto, UpdateInputDto } from './dto/inputs.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class InputsService {
  constructor(
    @InjectModel(Inputs.name) private inputsModel: Model<Inputs>,
  ) { }

  //? Crear un ingreso
  async createInput(createInputDto: CreateInputDto) {
    try {
      const input = await this.inputsModel.create(createInputDto);
      if (!input) {
        return {
          success: false,
          message: 'Error al crear el ingreso',
        };
      }
      return {
        success: true,
        message: 'Ingreso creado correctamente',
        data: input,
      };
    } catch (error) {
      throw error;
    }
  }

  //? Obtener todos los ingresos con paginación
  async getInputs(shopId: string, page: number, limit: number) {
    try {
      if (!shopId) {
        return {
          success: false,
          message: 'El ID de la tienda es requerido',
        };
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const inputs = await this.inputsModel
        .find({ shopId: shopId })
        .limit(limitNumber)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate('userId', 'username')
        .exec();

      if (inputs.length === 0) {
        return {
          success: false,
          message: 'No se encontraron ingresos',
        };
      }

      const totalInputs = await this.inputsModel.countDocuments({ shopId });

      return {
        success: true,
        message: 'Ingresos obtenidos correctamente',
        data: inputs,
        pagination: {
          total: totalInputs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalInputs / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //? Traer ingresos con filtrado complejo
  async getInputsWithFilter(
    shopId: string,
    page: number,
    limit: number,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    category?: string,
    paymentMethod?: string,
    minAmount?: number,
    maxAmount?: number,
  ) {
    try {
      if (!shopId) {
        return {
          success: false,
          message: 'El ID de la tienda es requerido',
        };
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const query: any = { shopId };

      if (userId) query.userId = userId;

      if (startDate) {
        const start = moment.tz(startDate, 'America/Argentina/Buenos_Aires').startOf('day').toDate();
        query.createdAt = { $gte: start };
      }

      if (endDate) {
        const end = moment.tz(endDate, 'America/Argentina/Buenos_Aires').endOf('day').toDate();
        query.createdAt = { ...query.createdAt, $lte: end };
      }

      if (category) query.category = category;
      if (paymentMethod) query.paymentMethod = paymentMethod;

      if (minAmount !== undefined || maxAmount !== undefined) { query.total = {}; if (minAmount !== undefined) query.total.$gte = minAmount; if (maxAmount !== undefined) query.total.$lte = maxAmount; }


      const inputs = await this.inputsModel
        .find(query)
        .limit(limitNumber)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate('userId', 'username')
        .exec();

      if (inputs.length === 0) {
        return {
          success: false,
          message: 'No se encontraron ingresos con los filtros aplicados',
        };
      }

      const totalInputs = await this.inputsModel.countDocuments(query);

      return {
        success: true,
        message: 'Ingresos filtrados obtenidos correctamente',
        data: inputs,
        pagination: {
          total: totalInputs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalInputs / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //? Obtener ingreso por ID
  async getInputById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de ingreso es requerido',
        };
      }

      const input = await this.inputsModel
        .findById(id)
        .populate('userId', 'username');
      if (!input) {
        return {
          success: false,
          message: 'Ingreso no encontrado',
        };
      }

      return {
        success: true,
        message: 'Ingreso encontrado',
        data: input,
      };
    } catch (error) {
      throw error;
    }
  }

  //? Actualizar ingreso por ID
  async updateInput(id: string, updateInputDto: UpdateInputDto) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de ingreso es requerido',
        };
      }

      const updated = await this.inputsModel.findByIdAndUpdate(
        id,
        updateInputDto,
        { new: true },
      );

      if (!updated) {
        return {
          success: false,
          message: 'No se pudo actualizar el ingreso',
        };
      }

      return {
        success: true,
        message: 'Ingreso actualizado correctamente',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  //? Eliminar ingreso por ID
  async deleteInput(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de ingreso es requerido',
        };
      }

      const deleted = await this.inputsModel.findByIdAndDelete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el ingreso',
        };
      }

      return {
        success: true,
        message: 'Ingreso eliminado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }
}
