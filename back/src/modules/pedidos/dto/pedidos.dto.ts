import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
import { PedidosPaymentEnum, PedidoTypeEnum } from '../enum/pedidos.enum';

export class CreatePedidoDto {
  @IsMongoId()
  shopId: string;

  @IsEnum(PedidoTypeEnum)
  deliveryType: PedidoTypeEnum;

  @IsEnum(PedidosPaymentEnum)
  paymentType: PedidosPaymentEnum;

  @IsNumber()
  total: number;

  @IsString()
  saleId: string;

  // Cliente
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @IsEmail()
  clientEmail: string;

  @IsOptional()
  @IsString()
  clientAddress?: string;

  @IsOptional()
  @IsString()
  clientCity?: string;

  @IsOptional()
  @IsString()
  clientPostalCode?: string;

  // Detalles de productos con variantes integradas
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  productDetails: {
    productId: string;
    quantity: number;
    sellPrice: number;
    variants: {
      size?: string;
      color?: string;
      quantity: number;
    }[];
  }[];
}