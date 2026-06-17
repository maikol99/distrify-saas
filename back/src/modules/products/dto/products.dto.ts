import {
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PriceListDto {
  @IsString()
  @IsNotEmpty()
  listName: string;

  @IsNumber()
  price: number;

  @IsNumber()
  buyPrice: number;

  @IsNumber()
  utility: number;

  @IsNumber()
  iva: number;
}

export class CreateProductDto {
  @IsMongoId()
  @IsNotEmpty()
  shopId: string;

  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  sellPrice: number;

  @IsNumber()
  @IsOptional()
  utilidad?: number;

  @IsNumber()
  @IsOptional()
  buyPrice?: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  maxQuantity?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListDto)
  @IsOptional()
  priceLists?: PriceListDto[];

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  creationDate?: Date;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expirationDate?: Date;

  @IsNumber()
  @IsOptional()
  expirationAlert?: number;

  @IsBoolean()
  @IsOptional()
  createdOffline?: boolean;

  @IsBoolean()
  @IsOptional()
  updatedOffline?: boolean;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedDate?: Date;
}
