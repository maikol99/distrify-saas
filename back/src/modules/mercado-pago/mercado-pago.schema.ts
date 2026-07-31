import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class MercadoPago {
  @Prop({ required: true, default: null })
  shopId: string;

  @Prop({ required: true, default: null })
  accessToken: string;

  @Prop()
  publicKey: string;
}

export const MercadoPagoSchema = SchemaFactory.createForClass(MercadoPago);

MercadoPagoSchema.index({ shopId: 1 });