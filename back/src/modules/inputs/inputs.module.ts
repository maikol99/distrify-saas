import { Module } from '@nestjs/common';
import { InputsService } from './inputs.service';
import { InputsController } from './inputs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inputs, InputsSchema } from './inputs.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Inputs.name,schema:InputsSchema}
    ]),
    PlanLimitsModule,
  ],
  controllers: [InputsController],
  providers: [InputsService],
})
export class InputsModule {}
