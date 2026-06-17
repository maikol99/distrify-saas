import {
  IsDataURI,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateSaleDto {
  @IsDefined()
  @IsNotEmpty()
  shopId: string;

  @IsDefined()
  @IsNotEmpty()
  productDetails: {
    productId: string;
    productName?: string;
    salePrice?: number;
    quantity: number;
    // Agregar variantes específicas para cada producto
    variants?: {
      size: string;
      color: string;
      quantity: number;
    }[];
  }[];

  @IsOptional()
  clientId: string;

  @IsOptional()
  clientName: string;

  @IsOptional()
  subtotal: number;

  @IsOptional()
  iva: number;

  @IsDefined()
  @IsNotEmpty()
  total: number;

  @IsDefined()
  @IsNotEmpty()
  cashier: string;

  @IsDefined()
  @IsNotEmpty()
  paymentMethod: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  creationDate: Date;

  @IsOptional()
  discount: number;

  @IsOptional()
  surcharge: number;

  @IsOptional()
  listName: string;

  @IsOptional()
  paymentMethods: {
    method: string;
    amount: number;
  }[];

  @IsDefined()
  @IsNotEmpty()
  isCancelled: boolean;

  @IsOptional()
  pedidoId: string;

  @IsOptional()
  createdFromShop: boolean;

  @IsOptional()
  pedidoType: string;

  @IsOptional()
  updateProducts: boolean;

  @IsOptional()
  userId?: string;
}