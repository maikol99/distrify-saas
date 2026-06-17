import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCajaDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  shopId: string;

  @IsDefined()
  @IsNotEmpty()
  userIdApertura: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDate()
  fechaApertura: Date;

  @IsDefined()
  @IsNotEmpty()
  estado: string;

  @IsDefined()
  @IsNotEmpty()
  entregasEfectivo: {
    inicial: number;
    final: number;
  };

}
