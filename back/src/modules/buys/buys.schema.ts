import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { BuysCategoriesEnum, BuysPaymentMethodsEnum } from './enum/buys.enum';

@Schema({
  timestamps: true,
})
export class Buys {
  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number },
      },
    ],
  })
  productDetails: {
    productId: mongoose.Schema.Types.ObjectId;
    quantity: number;
  }[];

  @Prop()
  total: number;

  @Prop()
  receiptNumber: string;

  @Prop()
  description: string;

  @Prop()
  notes: string;

  @Prop({ enum: BuysCategoriesEnum })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'Suppliers' })
  supplierId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  shopId: Types.ObjectId;

  @Prop()
  supplierName: string;

  @Prop()
  imagen: string;

  @Prop()
  imagesArray: string[];

  @Prop()
  date: Date;

  @Prop()
  creationDate: Date;

  @Prop()
  paymentMethod: string;

  @Prop({
    type: [
      {
        method: { type: String, enum: BuysPaymentMethodsEnum },
        amount: { type: Number },
      },
    ],
    default: [],
  })
  paymentMethods: { method: BuysPaymentMethodsEnum; amount: number }[];

  @Prop()
  userId: string;

  @Prop()
  userName: string;

  @Prop()
  cashierName: string;

  @Prop({ required: true, default: true })
  isPaid: boolean;

  @Prop({required:true,default:false})
  productsAdded: boolean;

  //Productos asignados a la compra
  @Prop({
    type:[
      {
        productId:{type:mongoose.Schema.Types.ObjectId,ref:'Products'},
        quantity:{type:Number},
        buyPrice:{type:Number},
      }
    ]
  })
  products:{
    productId:mongoose.Schema.Types.ObjectId,
    quantity:number,
    buyPrice:number,
  }[]

  // Gastos adicionales asociados a la compra (fletes, impuestos, etc.)
  @Prop({
    type: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        category: { type: String },
      },
    ],
    default: [],
  })
  additionalCosts: {
    description: string;
    amount: number;
    category: string;
  }[];

  // Total de gastos adicionales (calculado)
  @Prop({ default: 0 })
  totalAdditionalCosts: number;

  // Costo total real (total + totalAdditionalCosts)
  @Prop({ default: 0 })
  realCost: number;
}

export const BuysSchema = SchemaFactory.createForClass(Buys);

BuysSchema.index({ shopId: 1 });
