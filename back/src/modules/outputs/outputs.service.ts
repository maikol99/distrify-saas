import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Outputs } from './outputs.schema';
import { Model } from 'mongoose';
import { CreateOutputDto, UpdateOutputDto } from './dto/outputs.dto';
import * as moment from 'moment-timezone'

@Injectable()
export class OutputsService {
  constructor(
    @InjectModel(Outputs.name) private outputsModel: Model<Outputs>,
  ) { }

  //?Crear un egreso
  async createOutput(createOutputDto: CreateOutputDto) {
    try {
      const output = await this.outputsModel.create(createOutputDto);
      if (!output) {
        return {
          success: false,
          message: 'Error al crear el egreso',
        };
      }
      return {
        success: true,
        message: 'Egreso creado correctamente',
        data: output,
      };
    } catch (error) {
      throw error;
    }
  }

  //?Obtener todos los egresos con paginacion
  async getOutputs(shopId: string, page: number, limit: number) {
    try {
      if (!shopId) {
        return {
          success: false,
          message: 'El ID de la tienda es requerido',
        };
      }

      let pageNumber = Number(page) || 1;
      let limitNumber = Number(limit) || 10;

      const skip = (pageNumber - 1) * limitNumber;

      const outputs = await this.outputsModel
        .find({ shopId: shopId })
        .limit(limitNumber)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate('userId', 'username ')
        .exec();

      if (outputs.length === 0) {
        return {
          success: false,
          message: 'No se encontraron egresos',
        };
      }

      const totalOutputs = await this.outputsModel.countDocuments({
        shopId: shopId,
      });

      return {
        success: true,
        message: 'Egresos obtenidos correctamente',
        data: outputs,
        pagination: {
          total: totalOutputs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalOutputs / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //?Traer egresos con filtrado complejo
  async getOutputsWithFilter(
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

      let pageNumber = Number(page) || 1;
      let limitNumber = Number(limit) || 10;

      const skip = (pageNumber - 1) * limitNumber;

      const query: any = { shopId: shopId };
      if (userId) {
        query.userId = userId;
      }
      if (startDate) {
        const start = moment.tz(startDate, 'America/Argentina/Buenos_Aires').startOf('day').toDate();
        query.createdAt = { ...query.createdAt, $gte: start };
      }
      if (endDate) {
        const end = moment.tz(endDate, 'America/Argentina/Buenos_Aires').endOf('day').toDate();
        query.createdAt = { ...query.createdAt, $lte: end };
      }
      if (category) {
        query.category = category;
      }
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }

      if (minAmount !== undefined || maxAmount !== undefined) { query.total = {}; if (minAmount !== undefined) query.total.$gte = minAmount; if (maxAmount !== undefined) query.total.$lte = maxAmount; }

      const outputs = await this.outputsModel
        .find(query)
        .limit(limitNumber)
        .skip(skip)
        .sort({ createdAt: -1 })
        .populate('userId', 'username')
        .exec();

      if (outputs.length === 0) {
        return {
          success: false,
          message: 'No se encontraron egresos con los filtros aplicados',
        };
      }

      const totalOutputs = await this.outputsModel.countDocuments(query);

      return {
        success: true,
        message: 'Egresos filtrados obtenidos correctamente',
        data: outputs,
        pagination: {
          total: totalOutputs,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalOutputs / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //? Obtener un egreso por ID
  async getOutputById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de egreso es requerido',
        };
      }

      const output = await this.outputsModel
        .findById(id)
        .populate('userId', 'username');
      if (!output) {
        return {
          success: false,
          message: 'Egreso no encontrado',
        };
      }

      return {
        success: true,
        message: 'Egreso encontrado',
        data: output,
      };
    } catch (error) {
      throw error;
    }
  }

  //? Actualizar un egreso por ID
  async updateOutput(id: string, updateOutputDto: UpdateOutputDto) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de egreso es requerido',
        };
      }

      const updated = await this.outputsModel.findByIdAndUpdate(
        id,
        updateOutputDto,
        {
          new: true,
        },
      );

      if (!updated) {
        return {
          success: false,
          message: 'No se pudo actualizar el egreso',
        };
      }

      return {
        success: true,
        message: 'Egreso actualizado correctamente',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  //? Eliminar un egreso por ID
  async deleteOutput(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          message: 'ID de egreso es requerido',
        };
      }

      const deleted = await this.outputsModel.findByIdAndDelete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el egreso',
        };
      }

      return {
        success: true,
        message: 'Egreso eliminado correctamente',
      };
    } catch (error) {
      throw error;
    }
  }
}
