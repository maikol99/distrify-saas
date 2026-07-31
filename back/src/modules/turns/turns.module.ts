import { Module } from '@nestjs/common';
import { TurnsService } from './turns.service';
import { TurnsController } from './turns.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Turns, TurnsSchema } from 'src/modules/turns/turns.Schema';
import { Sales, SalesSchema } from 'src/modules/sales/sales.schema';
import { Inputs, InputsSchema } from 'src/modules/inputs/inputs.schema';
import { Outputs, OutputsSchema } from 'src/modules/outputs/outputs.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Turns.name, schema: TurnsSchema },
      { name: Sales.name, schema: SalesSchema },
      { name: Inputs.name, schema: InputsSchema },
      { name: Outputs.name, schema: OutputsSchema },
    ]),
    PlanLimitsModule,
    SettingsModule,
  ],
  controllers: [TurnsController],
  providers: [TurnsService],
})
export class TurnsModule {}
