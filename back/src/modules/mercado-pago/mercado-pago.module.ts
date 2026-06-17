import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoController } from './mercado-pago.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shops, ShopsSchema } from '../shops/shops.schema';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { SalesModule } from '../sales/sales.module';
import { MercadoPago, MercadoPagoSchema } from './mercado-pago.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Shops.name,schema:ShopsSchema},
      {name:Sales.name,schema:SalesSchema},
      {name:MercadoPago.name, schema: MercadoPagoSchema}
    ]),
    SalesModule,
    NotificationsModule
  ],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
})
export class MercadoPagoModule {}
