import { Module } from '@nestjs/common';
import { BuysService } from './buys.service';
import { BuysController } from './buys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Buys, BuysSchema } from './buys.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { Suppliers, SuppliersSchema } from '../suppliers/supplier.schema';
import { Products, ProductsSchema } from '../products/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Buys.name, schema: BuysSchema },
      { name: Suppliers.name, schema: SuppliersSchema },
      { name: Products.name, schema: ProductsSchema },
    ]),
  ],
  controllers: [BuysController],
  providers: [BuysService],
})
export class BuysModule {}
