import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sales, SalesSchema } from 'src/modules/sales/sales.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Products, ProductsSchema } from '../products/products.schema';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ProductsModule } from '../products/products.module';
import { Clients, ClientsSchema } from '../clients/clients.schema';
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema }]),
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
    ]),
    MongooseModule.forFeature([{ name: Clients.name, schema: ClientsSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports:[SalesService]
})
export class SalesModule {}
