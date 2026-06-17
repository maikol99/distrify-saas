import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class StockMovements {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop()
  productName: string;

  @Prop()
  productCode: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  fromLocation: string;

  @Prop()
  toLocation: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  previousQuantity: number;

  @Prop()
  newQuantity: number;

  @Prop()
  reason: string;

  @Prop()
  userId: string;

  @Prop()
  userName: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const StockMovementsSchema = SchemaFactory.createForClass(StockMovements);
