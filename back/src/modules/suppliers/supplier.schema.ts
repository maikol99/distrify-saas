import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Buys } from 'src/modules/buys/buys.schema';

@Schema({
  timestamps: true,
})
export class Suppliers {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  cuit: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buys' }] })
  buyId: Buys[];

  @Prop({ default: 0 })
  debt: number;

  @Prop()
  company: string;

  @Prop()
  creationDate: Date;

  @Prop()
  userName: string;
}

export const SuppliersSchema = SchemaFactory.createForClass(Suppliers);

SuppliersSchema.index({ shopId: 1 });
