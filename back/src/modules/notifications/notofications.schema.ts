import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  NotificationStatusEnum,
  NotificationTypeEnum,
} from './enum/notifications.enum';

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({ required: true })
  shopId: string;

  @Prop({ required: true, enum: NotificationTypeEnum })
  type: NotificationTypeEnum;

  @Prop({
    required: true,
    enum: NotificationStatusEnum,
    default: NotificationStatusEnum.UNREAD,
  })
  status: NotificationStatusEnum;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
