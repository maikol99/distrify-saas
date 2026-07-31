import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Sales } from 'src/modules/sales/sales.schema';

@Schema({
  timestamps: true,
})
export class Products {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  sellPrice: number;

  @Prop()
  utilidad: number;

  @Prop()
  buyPrice: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: 0 })
  depotStock: number;

  @Prop()
  minQuantity: number;

  @Prop()
  maxQuantity: number;

  @Prop([
    {
      listName: { type: String },
      price: { type: Number },
      buyPrice: { type: Number },
      utility: { type: Number },
      iva: { type: Number },
      minQuantity: { type: Number, default: 0 },
    },
  ])
  priceLists: {
    listName: string;
    price: number;
    buyPrice: number;
    utility: number;
    iva: number;
    minQuantity: number;
  }[];

  @Prop({ required: false, type: Types.ObjectId, ref: 'Suppliers' })
  supplierId: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  category: string;

  @Prop()
  creationDate: Date;

  @Prop()
  expirationDate: Date;

  @Prop()
  expirationAlert: number;

  @Prop()
  createdOffline: false;

  @Prop()
  updatedOffline: false;

  @Prop()
  userName: string;

  @Prop()
  updatedDate: Date;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Categories', default: null })
  categoryId: string;

  //Talles y colores
  @Prop([
    {
      size: { type: String },
      color: { type: String },
      quantity: { type: Number },
    },
  ])
  sizesAndColors: {
    size: string;
    color: string;
    quantity: number;
  }[];

  @Prop([
    {
      secure_url: { type: String },
      public_id: { type: String },
    },
  ])
  images: {
    secure_url: string;
    public_id: string;
  }[];

  @Prop({ default: true })
  showInStore: boolean;

  @Prop({ default: null })
  characteristics: string[];
}

export const ProductsSchema = SchemaFactory.createForClass(Products);

ProductsSchema.index({ shopId: 1 });
ProductsSchema.index({ shopId: 1, code: 1 });

ProductsSchema.pre('save', function (next) {
  const product = this as any;

  if (!product.priceLists || product.priceLists.length === 0) {
    product.priceLists = [
      { listName: 'Lista 1', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 2', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 3', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 4', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 5', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 6', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 7', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 8', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 9', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
      { listName: 'Lista 10', price: 0, buyPrice: 0, utility: 0, iva: 0, minQuantity: 0 },
    ];
  }
  next();
});
