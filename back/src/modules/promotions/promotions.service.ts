import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotions } from './promotions.schema';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectModel(Promotions.name)
    private promotionsModel: Model<Promotions>,
  ) {}

  async create(body: any) {
    try {
      if (!body.shopId) {
        throw new BadRequestException('shopId no definido');
      }
      const promotion = await this.promotionsModel.create(body);
      return {
        success: true,
        message: 'Promoción creada correctamente',
        data: promotion,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    shopId: string,
    page: number,
    limit: number,
    isActive?: string,
    type?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    try {
      const filter: any = { shopId };

      if (isActive !== undefined && isActive !== '') {
        filter.isActive = isActive === 'true';
      }

      if (type) {
        filter.type = type;
      }

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      if (startDate || endDate) {
        if (startDate) filter.startDate = { $gte: new Date(startDate) };
        if (endDate) {
          filter.endDate = filter.endDate || {};
          filter.endDate.$lte = new Date(endDate);
        }
      }

      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const promotions = await this.promotionsModel
        .find(filter)
        .populate('productIds', 'name code sellPrice')
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 });

      const total = await this.promotionsModel.countDocuments(filter);

      return {
        success: true,
        data: promotions,
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

  async findOne(id: string) {
    try {
      const promotion = await this.promotionsModel
        .findById(id)
        .populate('productIds', 'name code sellPrice quantity depotStock');
      if (!promotion) {
        throw new NotFoundException('Promoción no encontrada');
      }
      return { success: true, data: promotion };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, body: any) {
    try {
      const promotion = await this.promotionsModel.findByIdAndUpdate(id, body, { new: true });
      if (!promotion) {
        throw new NotFoundException('Promoción no encontrada');
      }
      return {
        success: true,
        message: 'Promoción actualizada correctamente',
        data: promotion,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const promotion = await this.promotionsModel.findByIdAndDelete(id);
      if (!promotion) {
        throw new NotFoundException('Promoción no encontrada');
      }
      return { success: true, message: 'Promoción eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  async getActive(shopId: string) {
    try {
      const now = new Date();
      const promotions = await this.promotionsModel
        .find({
          shopId,
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        })
        .populate('productIds', 'name code sellPrice quantity depotStock');
      return { success: true, data: promotions };
    } catch (error) {
      throw error;
    }
  }
}
