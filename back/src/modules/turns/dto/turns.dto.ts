import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTurnDto {
  @IsOptional()
  @IsString()
  descriptionApertura?: string;

  @IsNotEmpty()
  @IsString()
  shopId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsOptional()
  @IsNumber()
  efectivoRecibido?: number;
}

export class CloseTurnDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  descriptionCierre?: string;

  @IsOptional()
  @IsNumber()
  efectivoPresentado?: number;
}
