import { Module } from '@nestjs/common';
import { OutputsService } from './outputs.service';
import { OutputsController } from './outputs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Outputs, OutputsSchema } from './outputs.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Outputs.name,schema:OutputsSchema}
    ]),
    PlanLimitsModule,
  ],
  controllers: [OutputsController],
  providers: [OutputsService],
})
export class OutputsModule {}
