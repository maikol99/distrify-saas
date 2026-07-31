import {
  IsDate,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
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
  @IsBoolean()
  @IsOptional()
  storeActive?: boolean;

  @IsBoolean()
  @IsOptional()
  delivery?: boolean;

  @IsBoolean()
  @IsOptional()
  deliveryCharge?: boolean;

  @IsNumber()
  @IsOptional()
  deliveryPrice?: number;

  @IsObject()
  @IsOptional()
  shopImage?: {
    secure_url: string;
    public_id: string;
  };

  @IsBoolean()
  @IsOptional()
  isFirstLogin?: boolean;

  @IsBoolean()
  @IsOptional()
  isCentral?: boolean;

  @IsString()
  @IsOptional()
  centralId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

