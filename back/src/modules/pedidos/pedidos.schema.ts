import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Clients } from 'src/modules/clients/clients.schema';
import {
  PedidosPaymentEnum,
  PedidosPaymentStatusEnum,
  PedidosStatusEnum,
  PedidoTypeEnum,
} from './enum/pedidos.enum';

@Schema({
  timestamps: true,
})
export class Pedidos {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({
    required: true,
    enum: PedidoTypeEnum,
    default: PedidoTypeEnum.RETIRO,
  })
  deliveryType: PedidoTypeEnum;

  @Prop({ enum: PedidosStatusEnum, default: PedidosStatusEnum.PENDIENTE })
  status: PedidosStatusEnum;

  @Prop({ enum: PedidosPaymentStatusEnum, default: PedidosPaymentStatusEnum.PENDIENTE })
  paymentStatus: PedidosPaymentStatusEnum;

  @Prop({
    required: true,
    enum: PedidosPaymentEnum,
    default: PedidosPaymentEnum.MERCADOPAGO,
  })
  paymentType: PedidosPaymentEnum;

  @Prop({ required: true })
  total: number;

  @Prop({ required: false })
  saleId: string;

  @Prop({
    type: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      references: { type: String },
    },
    required: true,
  })
  client: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    references?: string;
  };

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number },
        sellPrice: { type: Number },
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
    quantity: number;
    sellPrice: number;
    variants: {
      size: string;
      color: string;
      quantity: number;
    }[];
  }[];
}

export const PedidosSchema = SchemaFactory.createForClass(Pedidos);
