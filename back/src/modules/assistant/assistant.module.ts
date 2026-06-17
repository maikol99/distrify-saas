import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, ProductsSchema } from '../products/products.schema';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { Clients, ClientsSchema } from '../clients/clients.schema';
import { Suppliers, SuppliersSchema } from '../suppliers/supplier.schema';
import { Caja, CajaSchema } from '../caja/caja.schema';
import { Buys, BuysSchema } from '../buys/buys.schema';
import { Shops, ShopsSchema } from '../shops/shops.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
      { name: Sales.name, schema: SalesSchema },
      { name: Clients.name, schema: ClientsSchema },
      { name: Suppliers.name, schema: SuppliersSchema },
      { name: Caja.name, schema: CajaSchema },
      { name: Buys.name, schema: BuysSchema },
      { name: Shops.name, schema: ShopsSchema },
    ]),
  ],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
