import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ClientPaymentsDto {
  @IsDefined()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsString()
  saleId?: string;

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
