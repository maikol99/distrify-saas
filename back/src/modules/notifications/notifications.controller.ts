import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  //Crear notificacion
  @Post('/post/create-notification')
  async createNotification(@Body() body: CreateNotificationDto) {
    return await this.notificationsService.create(body);
  }

  //Filtrar no tificaciones
  @UseGuards(JwtAuthGuard)
  @Get('/get/filter-notifications')
  async filterNotifications(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.notificationsService.filterNotifications(
      shopId,
      page,
      limit,
      type,
      status,
      startDate,
      endDate,
    );
  }

  //Marcar notificación como leída
  @UseGuards(JwtAuthGuard)
  @Patch('/patch/mark-as-read')
  async markAsRead(@Query('notificationId') notificationId: string) {
    return await this.notificationsService.markAsRead(notificationId);
  }

  //Obtener el total de notificaciones sin leer
  @UseGuards(JwtAuthGuard)
  @Get('/get/unread-count')
  async getUnreadCount(@Query('shopId') shopId: string) {
    return await this.notificationsService.getUnreadCount(shopId);
  }
}
