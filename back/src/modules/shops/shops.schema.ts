import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ShopPlanEnum,
  ShopsCategoriesEnum,
  ShopsPaymentStatusEnum,
  ShopsProvincesEnum,
  ShopStatusEnum,
} from './enum/shops.enum';
import { v4 as uuid } from 'uuid';

@Schema({
  timestamps: true,
})
export class Shops {
  @Prop({ default: () => uuid(), unique: true })
  publicId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  province: ShopsProvincesEnum;

  @Prop({ default: ShopsPaymentStatusEnum.PENDING })
  paymentStatus: ShopsPaymentStatusEnum;

  @Prop({ default: ShopStatusEnum.DEMO })
  status: ShopStatusEnum;

  @Prop()
  category: ShopsCategoriesEnum;

  @Prop()
  lastPayment: Date;

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ enum: ShopPlanEnum, default: ShopPlanEnum.FREE })
  plan: ShopPlanEnum;

  @Prop({
    type: Object,
    default: {
      secure_url: '',
      public_id: '',
    },
  })
  shopImage: {
    secure_url: string;
    public_id: string;
  };

  @Prop({ default: false })
  storeActive: boolean;

  @Prop({ default: false })
  delivery: boolean;

  @Prop({ default: false })
  deliveryCharge: boolean;

  @Prop({ default: 0 })
  deliveryPrice: number;

  @Prop({ default: false })
  isFirstLogin: boolean;

  @Prop({default:null})
  centralId:string

  @Prop({default:null})
  isCentral:boolean
}

export const ShopsSchema = SchemaFactory.createForClass(Shops);
