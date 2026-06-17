import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Promotions {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['discount', 'combo'] })
  type: string;

  @Prop({ type: [Types.ObjectId], ref: 'Products' })
  productIds: Types.ObjectId[];

  @Prop({ enum: ['percentage', 'fixed'], default: 'percentage' })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: null })
  comboPrice: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const PromotionsSchema = SchemaFactory.createForClass(Promotions);
