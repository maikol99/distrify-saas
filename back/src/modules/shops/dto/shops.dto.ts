import {
  IsDate,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';
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
