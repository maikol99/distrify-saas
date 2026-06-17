import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PaymentMethodsEnum } from './supplier-payments.enum';

@Schema({
  timestamps: true,
})
export class SupplierPayments {
  @Prop({ required: true, type: String })
  supplierId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Date, default: Date.now })
  date: Date;

  @Prop()
  description: string;

  @Prop({required:true,enum:PaymentMethodsEnum,default:PaymentMethodsEnum.EFECTIVO})
  paymentMethod: PaymentMethodsEnum;
}

export const SupplierPaymentsSchema =
  SchemaFactory.createForClass(SupplierPayments);
