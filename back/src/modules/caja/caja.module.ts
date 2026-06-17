import { Module } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Caja, CajaSchema } from 'src/modules/caja/caja.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { Outputs, OutputsSchema } from '../outputs/outputs.schema';
import { Buys, BuysSchema } from '../buys/buys.schema';
import { Inputs, InputsSchema } from '../inputs/inputs.schema';
import { ShopsModule } from '../shops/shops.module';
import { EmailsModule } from '../emails/emails.module';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Caja.name, schema: CajaSchema },
      { name: Sales.name, schema: SalesSchema },
      { name: Outputs.name, schema: OutputsSchema },
      { name: Buys.name, schema: BuysSchema },
      { name: Inputs.name, schema: InputsSchema },
    ]),
    EmailsModule,
    ShopsModule,
    PlanLimitsModule,
  ],
  controllers: [CajaController],
  providers: [CajaService],
})
export class CajaModule {}
