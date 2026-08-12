// src/outputs/dto/create-output.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOutputDto {
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // Aceptamos cualquier string de categoría (enum flexible)
  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsOptional()
  @IsString()
  userId?: string;

  // Aceptamos cualquier string de método de pago (enum flexible)
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  // Aceptamos string de fecha "YYYY-MM-DD" o ISO — no @IsDate() que requiere instancia Date
  @IsOptional()
  @IsString()
  date?: string;
}


export class UpdateOutputDto extends PartialType(CreateOutputDto){}