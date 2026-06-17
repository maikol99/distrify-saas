import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Clients, ClientsSchema } from './clients.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sales, SalesSchema } from '../sales/sales.schema';
import { Pedidos, PedidosSchema } from '../pedidos/pedidos.schema';
import { ClientPayments, ClientPaymentsSchema } from '../client-payments/client-payments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Clients.name, schema: ClientsSchema },
      {name:Sales.name,schema:SalesSchema},
      {name:Pedidos.name,schema:PedidosSchema},
      {name:ClientPayments.name,schema:ClientPaymentsSchema}
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
