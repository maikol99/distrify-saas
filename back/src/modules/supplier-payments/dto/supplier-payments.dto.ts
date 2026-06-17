import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SupplierPaymentsDto {
  @IsDefined()
  @IsNotEmpty()
  supplierId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  description: string;
}
