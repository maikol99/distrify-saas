import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailsService } from '../emails/emails.service';
import { Notification } from './notofications.schema';
import { CreateNotificationDto } from './dto/notifications.dto';
import { NotificationStatusEnum } from './enum/notifications.enum';
import * as moment from 'moment-timezone';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private emailsService: EmailsService,
  ) {}

  //?Crear nueva notifiacion
  async create(body: CreateNotificationDto) {
    const session = await this.notificationModel.db.startSession();
    await session.startTransaction();
    try {
      const notification = await this.notificationModel.create([body], {
        session,
      });

      if (!notification || notification.length === 0) {
        return {
          success: false,
          message: 'No se pudo crear la notificación',
        };
      }

      await session.commitTransaction();
      session.endSession();
      return {
        success: true,
        message: 'Notificación creada correctamente',
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  //Filtrar notificaciones
  async filterNotifications(
    shopId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const query: any = { shopId };

      if (type) {
        query.type = type;
      }

      if (status) {
        query.status = status;
      }

      if (startDate && endDate) {
        const start = moment
          .tz(startDate, 'America/Argentina/Buenos_Aires')
          .startOf('day')
          .toDate();
        const end = moment
          .tz(endDate, 'America/Argentina/Buenos_Aires')
          .endOf('day')
          .toDate();
        query.createdAt = {
          $gte: start,
          $lte: end,
        };
      }

      let pageNumber = Number(page) || 1;
      let limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const notifications = await this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .exec();

      if (notifications.length === 0) {
        return {
          success: false,
          message: 'No se encontraron notificaciones',
        };
      }

      const totalCount = await this.notificationModel
        .countDocuments(query)
        .exec();
      const totalPages = Math.ceil(totalCount / limitNumber);

      return {
        success: true,
        data: notifications,
        pagination: {
          total: totalCount,
          pages: totalPages,
          page: pageNumber,
          limit: limitNumber,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  //Marcar notificación como leída
  async markAsRead(notificationId: string) {
    try {
      const notification = await this.notificationModel.findOne({
        _id: notificationId,
        status: NotificationStatusEnum.UNREAD,
      });
      if (!notification) {
        return {
          success: false,
          message: 'Notificación no encontrada',
        };
      }

      notification.status = NotificationStatusEnum.READ;
      await notification.save();

      return {
        success: true,
        message: 'Notificación marcada como leída',
      };
    } catch (error) {
      throw error;
    }
  }

  //Obtener el total de notificaciones sin leer
  async getUnreadCount(shopId: string) {
    try {
      const count = await this.notificationModel.countDocuments({
        shopId,
        status: NotificationStatusEnum.UNREAD,
      });
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      throw error;
    }
  }
}
