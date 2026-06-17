import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { Returns, ReturnsSchema } from './returns.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { Products, ProductsSchema } from '../products/products.schema';
import { Clients, ClientsSchema } from '../clients/clients.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Returns.name, schema: ReturnsSchema }]),
    MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema }]),
    MongooseModule.forFeature([{ name: Products.name, schema: ProductsSchema }]),
    MongooseModule.forFeature([{ name: Clients.name, schema: ClientsSchema }]),

  ], 
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
