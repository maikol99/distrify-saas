import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Shops } from '../shops/shops.schema';
import { Products } from '../products/products.schema';
import { Users } from '../users/users.schema';
import { ShopPlanEnum } from '../shops/enum/shops.enum';

@Injectable()
export class PlanLimitsService {
  /** Límites por plan — leídos desde .env con defaults seguros */
  private readonly planLimits: Record<string, { maxProducts: number; maxUsers: number }>;

  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(Products.name) private productsModel: Model<Products>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private configService: ConfigService,
  ) {
    this.planLimits = {
      [ShopPlanEnum.FREE]: {
        maxProducts: this.configService.get<number>('PLAN_FREE_MAX_PRODUCTS', 20),
        maxUsers: this.configService.get<number>('PLAN_FREE_MAX_USERS', 1),
      },
      [ShopPlanEnum.BASIC]: {
        maxProducts: Infinity,
        maxUsers: this.configService.get<number>('PLAN_BASIC_MAX_USERS', 2),
      },
      [ShopPlanEnum.MEDIUM]: {
        maxProducts: Infinity,
        maxUsers: this.configService.get<number>('PLAN_MEDIUM_MAX_USERS', 3),
      },
      [ShopPlanEnum.PREMIUM]: {
        maxProducts: Infinity,
        maxUsers: Infinity,
      },
    };
  }

  private async getShopPlan(shopId: string): Promise<ShopPlanEnum> {
    const shop = await this.shopsModel.findById(shopId).select('plan').lean();
    let plan = (shop?.plan as ShopPlanEnum) ?? ShopPlanEnum.FREE;

    // Si algún usuario del shop tiene un trial de 7 días activo, tratamos al negocio como PREMIUM
    const userInTrial = await this.usersModel
      .findOne({ shopId, trialStartDate: { $exists: true } })
      .lean()
      .exec();

    if (userInTrial && !userInTrial.isPremium && userInTrial.trialStartDate) {
      const trialEnd = new Date(userInTrial.trialStartDate);
      trialEnd.setDate(trialEnd.getDate() + 7);
      if (new Date() <= trialEnd) {
        plan = ShopPlanEnum.PREMIUM;
      }
    }

    return plan;
  }

  /** Versión pública para uso desde guards externos */
  async getShopPlanPublic(shopId: string): Promise<ShopPlanEnum> {
    return this.getShopPlan(shopId);
  }

  /** Verifica que el shop no supere el límite de productos */
  async checkProductLimit(shopId: string): Promise<void> {
    const plan = await this.getShopPlan(shopId);
    const limits = this.planLimits[plan];
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
    const limits = this.planLimits[plan];
    if (limits.maxUsers === Infinity) return;

    const count = await this.usersModel.countDocuments({ shopId });
    if (count >= limits.maxUsers) {
      throw new ForbiddenException(
        `Tu plan ${plan} permite un máximo de ${limits.maxUsers} usuario${limits.maxUsers > 1 ? 's' : ''}. Actualizá tu plan para agregar más.`,
      );
    }
  }
}
