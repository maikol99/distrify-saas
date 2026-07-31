// returns.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { RefundType,ReturnType } from './enum/returns.enum';


@Schema({ timestamps: true })
export class Returns {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Sales' })
  originalSaleId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Clients' })
  clientId?: Types.ObjectId;

  @Prop({ required: true, enum: ReturnType })
  returnType: ReturnType;

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number },
        unitPrice: { type: Number }, // Precio al que se vendió
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
  returnedProducts: {
    productId: mongoose.Schema.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    variants?: {
      size: string;
      color: string;
      quantity: number;
    }[];
  }[];

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number },
        unitPrice: { type: Number }, // Precio actual del producto
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
  newProducts?: {
    productId: mongoose.Schema.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    variants?: {
      size: string;
      color: string;
      quantity: number;
    }[];
  }[];

  @Prop({ required: true })
  returnedAmount: number; // Total de lo devuelto

  @Prop({ default: 0 })
  newAmount: number; // Total de los nuevos productos (en caso de cambio)

  @Prop({ required: true })
  balanceDifference: number; // Positivo = a favor del cliente, Negativo = debe el cliente

  @Prop({ enum: RefundType })
  refundType?: RefundType;

  @Prop({ default: 0 })
  cashRefunded: number; // Efectivo devuelto

  @Prop({ default: 0 })
  creditGenerated: number; // Crédito a favor del cliente

  @Prop({ type: Types.ObjectId, ref: 'Sales' })
  newSaleId?: Types.ObjectId; // ID de la nueva venta generada por el cambio

  @Prop()
  reason: string; // Motivo de la devolución/cambio

  @Prop({ required: true })
  processedBy: string; // Usuario que procesó la devolución

  @Prop()
  notes?: string;
}

export const ReturnsSchema = SchemaFactory.createForClass(Returns);

ReturnsSchema.index({ shopId: 1 });
