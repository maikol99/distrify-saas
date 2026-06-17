import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OutputsCategoriesEnum, OutputsPaymentMethodsEnum } from './enum/outputs.enum';
import mongoose from 'mongoose';
import { Users } from '../users/users.schema';

@Schema({
  timestamps: true,
})
export class Outputs {
  @Prop({ required: true })
  shopId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: OutputsCategoriesEnum })
  category: OutputsCategoriesEnum;

  @Prop({ required: true })
  total: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  userId?:Users

  @Prop({required:true,enum:OutputsPaymentMethodsEnum,default:OutputsPaymentMethodsEnum.Efectivo})
  paymentMethod?: OutputsPaymentMethodsEnum;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

export const OutputsSchema = SchemaFactory.createForClass(Outputs);
