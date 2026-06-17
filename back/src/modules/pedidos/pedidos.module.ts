import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pedidos, PedidosSchema } from 'src/modules/pedidos/pedidos.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pedidos.name, schema: PedidosSchema }]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    NotificationsModule,
    EmailsModule
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
