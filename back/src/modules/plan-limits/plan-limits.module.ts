import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanLimitsService } from './plan-limits.service';
import { PlanGuard } from 'src/guards/plan.guard';
import { Shops, ShopsSchema } from '../shops/shops.schema';
import { Products, ProductsSchema } from '../products/products.schema';
import { Users, UsersSchema } from '../users/users.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shops.name, schema: ShopsSchema },
      { name: Products.name, schema: ProductsSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
  ],
  providers: [PlanLimitsService, PlanGuard],
  exports: [PlanLimitsService, PlanGuard],
})
export class PlanLimitsModule {}
