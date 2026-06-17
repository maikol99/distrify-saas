import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserPermissions,
  UserPermissionsSchema,
} from 'src/modules/permissions/permissions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPermissions.name, schema: UserPermissionsSchema },
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
