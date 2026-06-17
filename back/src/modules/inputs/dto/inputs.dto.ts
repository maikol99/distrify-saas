// src/outputs/dto/create-output.dto.ts

import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { InputsCategoriesEnum,InputsPaymentMethodsEnum } from '../enum/inputs.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInputDto {
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(InputsCategoriesEnum)
  @IsNotEmpty()
  category: InputsCategoriesEnum;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(InputsPaymentMethodsEnum)
  @IsOptional()
  paymentMethod?: InputsPaymentMethodsEnum;

  @IsOptional()
  @IsDate()
  date?: Date;
}

export class UpdateInputDto extends PartialType(CreateInputDto){}