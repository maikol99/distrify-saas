import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BuysModule } from './modules/buys/buys.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { CajaModule } from './modules/caja/caja.module';
import { TurnsModule } from './modules/turns/turns.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shops.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ShopGuard } from './guards/shop-guard.guard';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ClientPaymentsModule } from './modules/client-payments/client-payments.module';
import { OutputsModule } from './modules/outputs/outputs.module';
import { InputsModule } from './modules/inputs/inputs.module';
import { EmailsModule } from './modules/emails/emails.module';
import { MercadoPagoModule } from './modules/mercado-pago/mercado-pago.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SupplierPaymentsModule } from './modules/supplier-payments/supplier-payments.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { PlanLimitsModule } from './modules/plan-limits/plan-limits.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { PromotionsModule } from './modules/promotions/promotions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URI'),
        dbName: configService.get<string>('MONGO_DB_NAME', 'distrify'),
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        autoIndex: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 50,
        },
      ],
    }),
    // Módulos de la aplicación
    ProductsModule,
    SalesModule,
    SuppliersModule,
    ClientsModule,
    BuysModule,
    ReportsModule,
    PedidosModule,
    CajaModule,
    TurnsModule,
    AuthModule,
    ShopsModule,
    UsersModule,
    CategoriesModule,
    ClientPaymentsModule,
    OutputsModule,
    InputsModule,
    EmailsModule,
    MercadoPagoModule,
    NotificationsModule,
    SupplierPaymentsModule,
    ReturnsModule,
    AssistantModule,
    PlanLimitsModule,
    AdminModule,
    SettingsModule,
    StockMovementsModule,
    PromotionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ShopGuard,
    },
  ],
})
export class AppModule {}
