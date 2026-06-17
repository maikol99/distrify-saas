import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';
import { PLAN_KEY } from 'src/decorators/plan.decorator';
import { PlanLimitsService } from 'src/modules/plan-limits/plan-limits.service';

const PLAN_HIERARCHY: Record<ShopPlanEnum, number> = {
  [ShopPlanEnum.FREE]: 0,
  [ShopPlanEnum.BASIC]: 1,
  [ShopPlanEnum.MEDIUM]: 2,
  [ShopPlanEnum.PREMIUM]: 3,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private planLimitsService: PlanLimitsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<ShopPlanEnum[]>(
      PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPlans || requiredPlans.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const shopId = request.user?.shopId;
    if (!shopId) throw new ForbiddenException('No se pudo determinar el negocio.');

    const plan = await this.planLimitsService.getShopPlanPublic(shopId);
    if (!plan) throw new ForbiddenException('Negocio no encontrado.');

    const shopLevel = PLAN_HIERARCHY[plan] ?? 0;
    const minRequired = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p]));

    if (shopLevel < minRequired) {
      const planNames = requiredPlans.join(', ');
      throw new ForbiddenException(
        `Esta función requiere el plan ${planNames} o superior. Tu plan actual es ${plan}.`,
      );
    }

    return true;
  }
}
