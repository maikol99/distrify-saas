import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Shops', unique: true })
  shopId: Types.ObjectId;

  @Prop({ default: false })
  turnsEnabled: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
