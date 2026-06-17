import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shops } from '../shops/shops.schema';
import { Products } from '../products/products.schema';
import { Users } from '../users/users.schema';
import { ShopPlanEnum } from '../shops/enum/shops.enum';

/** Límites por plan */
const PLAN_LIMITS = {
  [ShopPlanEnum.FREE]: {
    maxProducts: 20,
    maxUsers: 1,
  },
  [ShopPlanEnum.BASIC]: {
    maxProducts: Infinity,
    maxUsers: 2,
  },
  [ShopPlanEnum.MEDIUM]: {
    maxProducts: Infinity,
    maxUsers: 3,
  },
  [ShopPlanEnum.PREMIUM]: {
    maxProducts: Infinity,
    maxUsers: Infinity,
  },
};

@Injectable()
export class PlanLimitsService {
  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
  ) {}

  private async getShopPlan(shopId: string): Promise<ShopPlanEnum> {
    const shop = await this.shopsModel.findById(shopId).select('plan').lean();
    return (shop?.plan as ShopPlanEnum) ?? ShopPlanEnum.FREE;
  }

  /** Versión pública para uso desde guards externos */
  async getShopPlanPublic(shopId: string): Promise<ShopPlanEnum> {
    return this.getShopPlan(shopId);
  }

  /** Verifica que el shop no supere el límite de productos */
  async checkProductLimit(shopId: string): Promise<void> {
    const plan = await this.getShopPlan(shopId);
    const limits = PLAN_LIMITS[plan];
    if (limits.maxProducts === Infinity) return;

    const count = await this.productsModel.countDocuments({ shopId });
    if (count >= limits.maxProducts) {
      throw new ForbiddenException(
        `Tu plan ${plan} permite un máximo de ${limits.maxProducts} productos. Actualizá tu plan para agregar más.`,
      );
    }
  }

  /** Verifica que el shop no supere el límite de usuarios */
  async checkUserLimit(shopId: string): Promise<void> {
    const plan = await this.getShopPlan(shopId);
    const limits = PLAN_LIMITS[plan];
    if (limits.maxUsers === Infinity) return;

    const count = await this.usersModel.countDocuments({ shopId });
    if (count >= limits.maxUsers) {
      throw new ForbiddenException(
        `Tu plan ${plan} permite un máximo de ${limits.maxUsers} usuario${limits.maxUsers > 1 ? 's' : ''}. Actualizá tu plan para agregar más.`,
      );
    }
  }
}
