import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shops, ShopsSchema } from './shops.schema';
import { EmailsModule } from '../emails/emails.module';
import { Users, UsersSchema } from '../users/users.schema';
import { Sales, SalesSchema } from '../sales/sales.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shops.name, schema: ShopsSchema },
      {name:Users.name,schema:UsersSchema},
    ]),

    EmailsModule
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
