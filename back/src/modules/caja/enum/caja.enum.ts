import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsDate,
  IsMongoId,
  ValidateNested,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class TotalesDto {
  @IsNumber()
  @IsOptional()
  totalEfectivo?: number;

  @IsNumber()
  @IsOptional()
  totalTarjeta?: number;

  @IsNumber()
  @IsOptional()
  totalCheque?: number;

  @IsNumber()
  @IsOptional()
  totalTransferencia?: number;

  @IsNumber()
  @IsOptional()
  totalCuentaCorriente?: number;
}

class MovimientoDto {
  @IsEnum(['venta', 'compra', 'egreso', 'ingreso', 'ajuste'])
  tipo: string;

  @IsString()
  descripcion: string;

  @IsEnum(['efectivo', 'tarjeta', 'cheque', 'transferencia', 'cuenta_corriente'])
  metodo: string;

  @IsNumber()
  monto: number;

  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsMongoId()
  @IsOptional()
  referenciaId?: string;

  @IsMongoId()
  usuarioId: string;
}

class ArqueoDto {
  @IsNumber()
  totalEsperado: number;

  @IsNumber()
  totalReal: number;

  @IsNumber()
  diferencia: number;
}

class EntregasEfectivoDto {
  @IsNumber()
  inicial: number;

  @IsNumber()
  final: number;
}

export class CreateCajaDto {
  @IsMongoId()
  shopId: string;

  @IsMongoId()
  empleadoAperturaId: string;

  @IsOptional()
  @IsMongoId()
  empleadoCierreId?: string;

  @IsDate()
  @Type(() => Date)
  fechaApertura: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaCierre?: Date;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsEnum(['abierta', 'cerrada', 'en_revision'])
  estado: string;

  @ValidateNested()
  @Type(() => TotalesDto)
  @IsOptional()
  totalVentas?: TotalesDto;

  @ValidateNested()
  @Type(() => TotalesDto)
  @IsOptional()
  totalCompras?: TotalesDto;

  @ValidateNested()
  @Type(() => TotalesDto)
  @IsOptional()
  totalGastos?: TotalesDto;

  @ValidateNested()
  @Type(() => TotalesDto)
  @IsOptional()
  totalIngresos?: TotalesDto;

  @ValidateNested()
  @Type(() => EntregasEfectivoDto)
  entregasEfectivo: EntregasEfectivoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovimientoDto)
  movimientos: MovimientoDto[];

  @ValidateNested()
  @Type(() => ArqueoDto)
  @IsOptional()
  arqueoFinal?: ArqueoDto;
}
