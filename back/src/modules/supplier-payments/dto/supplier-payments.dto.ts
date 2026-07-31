import {
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethodsEnum } from '../supplier-payments.enum';

export class SupplierPaymentsDto {
  @IsDefined()
  @IsNotEmpty()
  supplierId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethodsEnum)
  paymentMethod?: PaymentMethodsEnum;

  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  description: string;
}
