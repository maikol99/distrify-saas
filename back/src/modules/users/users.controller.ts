import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get/get-user/:id')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.getUser(id);
  }

  @Get('get/get-users/:shopId')
  async getUsers(@Param('shopId') shopId: string) {
    return await this.usersService.getUsers(shopId);
  }

  @Patch('/patch/update-user/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return await this.usersService.updateUser(id, body);
  }

  @Delete('delete/delete-user/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return await this.usersService.deleteUser(userId);
  }

  @Get('get/search-users')
  async searchUsers(
    @Query('shopId') shopId: string,
    @Query('name') name: string,
  ) {
    return await this.usersService.searchUsersByName(shopId, name);
  }

  @Patch('patch/update-routes')
  async updateRoutes() {
    return await this.usersService.enableAllRoutesForAllUsers();
  }

  @Get('get/is-email-verified/:userId')
  async isEmailVerified(@Param('userId') userId: string) {
    return await this.usersService.checkIfEmailVerified(userId);
  }

  @Get('get/get-user-fields/:id')
  async getUserFields(
    @Param('id') id: string,
    @Query('fields') fields: string,
  ) {
    const fieldsArray = fields.split(',').map((f) => f.trim());
    return await this.usersService.getUserFields(id, fieldsArray);
  }
}
