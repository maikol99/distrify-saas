import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  InputsCategoriesEnum,
  InputsPaymentMethodsEnum,
} from './enum/inputs.enum';
import mongoose from 'mongoose';
import { Users } from '../users/users.schema';

@Schema({
  timestamps: true,
})
export class Inputs {
  @Prop({ required: true })
  shopId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: InputsCategoriesEnum, required: true })
  category: InputsCategoriesEnum;

  @Prop({ required: true })
  total: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  userId?: Users;

  @Prop({
    enum: InputsPaymentMethodsEnum,
    required: false,
    default: InputsPaymentMethodsEnum.Efectivo,
  })
  paymentMethod?: string;
}

export const InputsSchema = SchemaFactory.createForClass(Inputs);
