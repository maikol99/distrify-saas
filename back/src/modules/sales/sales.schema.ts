import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Clients } from 'src/modules/clients/clients.schema';
import {
  PaymentMethodsEnum,
  PedidoType,
  SalePaymentStatusEnum,
  SaleStatusEnum,
} from './enum/sales.enum';

@Schema({
  timestamps: true,
})
export class Sales {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', default: null },
        productName: { type: String },
        salePrice: { type: Number },
        quantity: { type: Number },
        isCombo: { type: Boolean, default: false },
        isCustom: { type: Boolean, default: false },
        comboProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
        variants: [
          {
            size: { type: String },
            color: { type: String },
            quantity: { type: Number },
          },
        ],
      },
    ],
  })
  productDetails: {
    productId: mongoose.Schema.Types.ObjectId;
    productName: string;
    salePrice: number;
    quantity: number;
    isCombo?: boolean;
    isCustom?: boolean;
    comboProducts?: mongoose.Schema.Types.ObjectId[];
    variants?: {
      size: string;
      color: string;
      quantity: number;
    }[];
  }[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Clients' })
  clientId: Clients;

  @Prop()
  clientName: string;

  @Prop()
  subtotal: number;

  @Prop()
  iva: number;

  @Prop()
  total: number;

  @Prop()
  cashier: string;

  @Prop({ enum: PaymentMethodsEnum, default: PaymentMethodsEnum.EFECTIVO })
  paymentMethod: string;

  @Prop()
  creationDate: Date;

  @Prop()
  discount: number;

  @Prop()
  surcharge: number;

  @Prop()
  listName: string;

  @Prop({
    type: [
      {
        method: { type: String, enum: PaymentMethodsEnum },
        amount: { type: Number },
      },
    ],
    default: [],
  })
  paymentMethods: { method: PaymentMethodsEnum; amount: number }[];

  @Prop({
    required: true,
    enum: SaleStatusEnum,
    default: SaleStatusEnum.COMPLETED,
  })
  status: SaleStatusEnum;

  @Prop()
  pedidoId: string;

  @Prop()
  createdOffline: false;

  @Prop()
  updatedOffline: false;

  @Prop({ default: false })
  createdFromShop: boolean;

  @Prop({ enum: PedidoType, default: PedidoType.RETIRO })
  pedidoType: string;

  @Prop()
  paymentId: string;

  @Prop({
    enum: SalePaymentStatusEnum,
    default: SalePaymentStatusEnum.PAID,
  })
  paymentStatus: SalePaymentStatusEnum;

  @Prop({ default: false })
  hasReturns: boolean;

  @Prop({ default: false })
  hasExchanges: boolean;

  @Prop()
  userId?: string;

  @Prop()
  cancelledAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sales' })
  originalSaleId?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sales' })
  relatedSaleId?: Types.ObjectId;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);

SalesSchema.index({ shopId: 1 });
SalesSchema.index({ shopId: 1, createdAt: -1 });
