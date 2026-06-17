// src/outputs/dto/create-output.dto.ts

import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OutputsCategoriesEnum, OutputsPaymentMethodsEnum } from '../enum/outputs.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOutputDto {
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(OutputsCategoriesEnum)
  @IsNotEmpty()
  category: OutputsCategoriesEnum;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(OutputsPaymentMethodsEnum)
  @IsOptional()
  paymentMethod?: OutputsPaymentMethodsEnum;

  @IsOptional()
  @IsDate()
  date?: Date;
}


export class UpdateOutputDto extends PartialType(CreateOutputDto){}