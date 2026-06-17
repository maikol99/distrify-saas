import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/utils/roles.decorator';

@UseGuards(PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('post/assign-permissions')
  assignPermissions(
    @Body('userId') userId: string,
    @Body('routes') routes: string[],
  ) {
    return this.permissionsService.assignPermissions(userId, routes);
  }


}
