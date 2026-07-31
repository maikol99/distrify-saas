import {
  IsDate,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import {
  ShopsCategoriesEnum,
  ShopsPaymentStatusEnum,
  ShopStatusEnum,
} from '../enum/shops.enum';

export class CreateShopDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  image: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsDefined()
  @IsString()
  paymentStatus: ShopsPaymentStatusEnum;

  @IsDefined()
  @IsString()
  status: ShopStatusEnum;

  @IsString()
  category: ShopsCategoriesEnum;

  @IsDate()
  lastPayment: Date;
}

export class UpdateShopDto extends PartialType(CreateShopDto) {
  storeActive?: boolean;
  delivery?: boolean;
  deliveryCharge?: boolean;
  deliveryPrice?: number;
  shopImage?: {
    secure_url: string;
    public_id: string;
  };
  isFirstLogin?: boolean;
  isCentral?: boolean;
  centralId?: string;
  description?: string;
}

