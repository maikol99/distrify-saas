import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class ClientPayments {
  @Prop({ required: true, type: String })
  clientId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sales' })
  saleId?: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Date, default: Date.now })
  date: Date;

  @Prop()
  description: string;
}

export const ClientPaymentsSchema = SchemaFactory.createForClass(ClientPayments);