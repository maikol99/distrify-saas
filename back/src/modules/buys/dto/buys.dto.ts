import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BuysCategoriesEnum, BuysPaymentMethodsEnum } from '../enum/buys.enum';

export class ProductInBuyDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  buyPrice: number;
}

export class AdditionalCostDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  category?: string;
}

export class CreateBuyDto {
  @IsArray()
  @IsOptional()
  productDetails?: Array<{
    productId: string;
    quantity: number;
  }>;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(BuysCategoriesEnum)
  @IsOptional()
  category?: BuysCategoriesEnum;

  @IsMongoId()
  @IsOptional()
  supplierId?: string;

  @IsMongoId()
  @IsNotEmpty()
  shopId: string; 

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsArray()
  @IsOptional()
  imagesArray?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  creationDate?: Date;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsArray()
  @IsOptional()
  paymentMethods?: Array<{
    method: BuysPaymentMethodsEnum;
    amount: number;
  }>;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  cashierName?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  productsAdded?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductInBuyDto)
  @IsOptional()
  products?: ProductInBuyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalCostDto)
  @IsOptional()
  additionalCosts?: AdditionalCostDto[];

  @IsNumber()
  @IsOptional()
  totalAdditionalCosts?: number;

  @IsNumber()
  @IsOptional()
  realCost?: number;
}
