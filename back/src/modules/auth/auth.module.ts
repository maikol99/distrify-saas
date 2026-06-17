import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Users, UsersSchema } from '../users/users.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { EmailsModule } from '../emails/emails.module';
import { Shops, ShopsSchema } from '../shops/shops.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Global() // Hace que el módulo esté disponible globalmente
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Shops.name, schema: ShopsSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '8h'),
          issuer: configService.get<string>('JWT_ISSUER', 'your-app-name'),
          audience: configService.get<string>('JWT_AUDIENCE', 'your-app-users'),
        },
      }),
    }),
    EmailsModule,
    PlanLimitsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    // Opcional: Aplicar guard globalmente
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    JwtModule, // Exportar JwtModule para uso en otros módulos
    PassportModule,
  ],
})
export class AuthModule { }
