import { Module } from '@nestjs/common';
import { ClientPaymentsService } from './client-payments.service';
import { ClientPaymentsController } from './client-payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientPayments, ClientPaymentsSchema } from './client-payments.schema';
import { Clients, ClientsSchema } from '../clients/clients.schema';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:ClientPayments.name,schema:ClientPaymentsSchema},
      {name:Clients.name,schema:ClientsSchema},
      {name:Sales.name,schema:SalesSchema},
    ]),
    PlanLimitsModule,
  ],
  controllers: [ClientPaymentsController],
  providers: [ClientPaymentsService],
})
export class ClientPaymentsModule {}
