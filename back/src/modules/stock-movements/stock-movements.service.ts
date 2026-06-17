import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovements } from './stock-movements.schema';

@Injectable()
export class StockMovementsService {
  private readonly logger = new Logger(StockMovementsService.name);

  constructor(
    @InjectModel(StockMovements.name)
    private stockMovementsModel: Model<StockMovements>,
  ) {}

  async log(data: {
    shopId: string;
    productId: string;
    productName: string;
    productCode: string;
    type: string;
    fromLocation?: string;
    toLocation?: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason?: string;
    userId?: string;
    userName?: string;
  }) {
    try {
      await this.stockMovementsModel.create({
        ...data,
        date: new Date(),
      });
    } catch (error) {
      this.logger.error('Error al registrar movimiento de stock:', error);
    }
  }

  async findAll(
    shopId: string,
    page: number,
    limit: number,
    productId?: string,
    search?: string,
    type?: string,
    fromLocation?: string,
    toLocation?: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
  ) {
    try {
      const filter: any = { shopId };

      if (productId) {
        filter.productId = productId;
      }

      if (search) {
        filter.$or = [
          { productName: { $regex: search, $options: 'i' } },
          { productCode: { $regex: search, $options: 'i' } },
        ];
      }

      if (type) {
        const types = type.split(',');
        filter.type = { $in: types };
      }

      if (fromLocation) {
        filter.fromLocation = fromLocation;
      }

      if (toLocation) {
        filter.toLocation = toLocation;
      }

      if (userId) {
        filter.userId = userId;
      }

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;
      const skip = (pageNumber - 1) * limitNumber;

      const movements = await this.stockMovementsModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ date: -1 });

      const total = await this.stockMovementsModel.countDocuments(filter);

      return {
        success: true,
        message: 'Movimientos encontrados',
        data: movements,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findByProduct(productId: string, shopId: string, page?: number, limit?: number) {
    try {
      const filter: any = { productId, shopId };

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 20;
      const skip = (pageNumber - 1) * limitNumber;

      const movements = await this.stockMovementsModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ date: -1 });

      const total = await this.stockMovementsModel.countDocuments(filter);

      return {
        success: true,
        data: movements,
        pagination: {
          total,
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
