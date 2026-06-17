import { SetMetadata } from '@nestjs/common';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';

export const PLAN_KEY = 'requiredPlans';
export const RequirePlan = (...plans: ShopPlanEnum[]) => SetMetadata(PLAN_KEY, plans);
