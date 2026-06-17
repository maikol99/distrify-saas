import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sales, SalesSchema } from 'src/modules/sales/sales.schema';
import { Buys, BuysSchema } from '../buys/buys.schema';
import { Products, ProductsSchema } from '../products/products.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Inputs, InputsSchema } from '../inputs/inputs.schema';
import { Outputs, OutputsSchema } from '../outputs/outputs.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sales.name, schema: SalesSchema },
      { name: Products.name, schema: ProductsSchema },
      { name: Buys.name, schema: BuysSchema },
      { name: Inputs.name, schema: InputsSchema },
      { name: Outputs.name, schema: OutputsSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PlanLimitsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
