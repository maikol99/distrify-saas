import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ShopPlanEnum, ShopStatusEnum } from '../shops/enum/shops.enum';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── MÉTRICAS ──────────────────────────────────────────────────────────────

  @Get('/metrics')
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  // ─── SHOPS ─────────────────────────────────────────────────────────────────

  @Get('/shops')
  async getAllShops(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('plan') plan: string,
    @Query('status') status: string,
  ) {
    return this.adminService.getAllShops(page, limit, search, plan, status);
  }

  @Get('/shops/:shopId')
  async getShopDetail(@Param('shopId') shopId: string) {
    return this.adminService.getShopDetail(shopId);
  }

  @Patch('/shops/:shopId/plan')
  async updateShopPlan(
    @Param('shopId') shopId: string,
    @Body('plan') plan: ShopPlanEnum,
  ) {
    return this.adminService.updateShopPlan(shopId, plan);
  }

  @Patch('/shops/:shopId/status')
  async updateShopStatus(
    @Param('shopId') shopId: string,
    @Body('status') status: ShopStatusEnum,
  ) {
    return this.adminService.updateShopStatus(shopId, status);
  }

  @Delete('/shops/:shopId')
  async deleteShop(@Param('shopId') shopId: string) {
    return this.adminService.deleteShop(shopId);
  }

  // ─── USUARIOS ──────────────────────────────────────────────────────────────

  @Get('/users')
  async getAllUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('shopId') shopId: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search, shopId);
  }

  @Delete('/users/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('/users/:userId/routes')
  async updateUserRoutes(
    @Param('userId') userId: string,
    @Body('routesAllowed') routesAllowed: string[],
  ) {
    return this.adminService.updateUserRoutes(userId, routesAllowed);
  }

  // ─── ACCIONES MASIVAS ──────────────────────────────────────────────────────

  @Patch('/bulk/update-all-plans')
  async updateAllShopsPlan(@Body('plan') plan: ShopPlanEnum) {
    return this.adminService.updateAllShopsPlan(plan);
  }

  @Get('/bulk/preview-inactive')
  async previewInactiveShops() {
    return this.adminService.previewInactiveShops();
  }

  @Delete('/bulk/delete-inactive')
  async deleteInactiveShops() {
    return this.adminService.deleteInactiveShops();
  }
}
