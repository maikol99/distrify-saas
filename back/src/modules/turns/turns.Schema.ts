/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TurnStatusEnum } from './enum/turns.enum';

@Schema({ timestamps: true })
export class Turns extends Document {
  @Prop()
  descriptionApertura: string;

  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop()
  descriptionCierre: string;

  @Prop({ default: 0 })
  efectivoRecibido: number;

  @Prop({ default: 0 })
  efectivoPresentado: number;

  @Prop({ default: 0 })
  efectivoRealSistema: number;

  @Prop({ default: 0 })
  totalVentas: number;

  @Prop({ default: 0 })
  balancePresentadoReal: number;

  @Prop()
  userId: string;

  @Prop()
  userName: string;

  @Prop({ enum: TurnStatusEnum, default: TurnStatusEnum.ABIERTO })
  status: TurnStatusEnum;

  @Prop({ default: () => new Date() })
  horaApertura: Date;

  @Prop()
  horaCierre: Date;

  // Desglose por método de pago (calculado al cierre)
  @Prop({ default: 0 })
  totalEfectivo: number;

  @Prop({ default: 0 })
  totalTransferencia: number;

  @Prop({ default: 0 })
  totalTarjeta: number;

  @Prop({ default: 0 })
  totalCuentaCorriente: number;

  // Totales de ingresos y egresos del turno
  @Prop({ default: 0 })
  totalIngresos: number;

  @Prop({ default: 0 })
  totalEgresos: number;
}

export const TurnsSchema = SchemaFactory.createForClass(Turns);
