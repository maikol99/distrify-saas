import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Caja {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Shop' })
  shopId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Users' })
  userIdApertura: Types.ObjectId;

  @Prop()
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  userIdCierre?: Types.ObjectId;

  @Prop({ required: true })
  fechaApertura: Date;

  @Prop()
  fechaCierre: Date;

  @Prop()
  observaciones: string;

  @Prop({ required: true, default: 'abierta' })
  estado: 'abierta' | 'cerrada' | 'en_revision';

  @Prop({
    type: {
      totalEfectivo: { type: Number, default: 0 },
      totalTarjeta: { type: Number, default: 0 },
      totalCheque: { type: Number, default: 0 },
      totalTransferencia: { type: Number, default: 0 },
      totalCuentaCorriente: { type: Number, default: 0 },
    },
    default: {
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalCheque: 0,
      totalTransferencia: 0,
      totalCuentaCorriente: 0,
    },
  })
  totalVentas: Record<string, number>;

  @Prop({
    type: {
      totalEfectivo: { type: Number, default: 0 },
      totalTarjeta: { type: Number, default: 0 },
      totalCheque: { type: Number, default: 0 },
      totalTransferencia: { type: Number, default: 0 },
      totalCuentaCorriente: { type: Number, default: 0 },
    },
    default: {
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalCheque: 0,
      totalTransferencia: 0,
      totalCuentaCorriente: 0,
    },
  })
  totalCompras: Record<string, number>;

  @Prop({
    type: {
      totalEfectivo: { type: Number, default: 0 },
      totalTarjeta: { type: Number, default: 0 },
      totalCheque: { type: Number, default: 0 },
      totalTransferencia: { type: Number, default: 0 },
      totalCuentaCorriente: { type: Number, default: 0 },
    },
    default: {
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalCheque: 0,
      totalTransferencia: 0,
      totalCuentaCorriente: 0,
    },
  })
  totalGastos: Record<string, number>;

  @Prop({
    type: {
      totalEfectivo: { type: Number, default: 0 },
      totalTarjeta: { type: Number, default: 0 },
      totalCheque: { type: Number, default: 0 },
      totalTransferencia: { type: Number, default: 0 },
      totalCuentaCorriente: { type: Number, default: 0 },
    },
    default: {
      totalEfectivo: 0,
      totalTarjeta: 0,
      totalCheque: 0,
      totalTransferencia: 0,
      totalCuentaCorriente: 0,
    },
  })
  totalIngresos: Record<string, number>;

  @Prop({
    type: {
      totalVentas: { type: Number, default: 0 },
      totalCompras: { type: Number, default: 0 },
      totalGastos: { type: Number, default: 0 },
      totalIngresos: { type: Number, default: 0 },
    },
    default: {
      totalVentas: 0,
      totalCompras: 0,
      totalGastos: 0,
      totalIngresos: 0,
    },
  })
  totalCaja: {
    totalVentas: number;
    totalCompras: number;
    totalGastos: number;
    totalIngresos: number;
  };

  @Prop({
    type: {
      inicial: { type: Number, default: 0 },
      final: { type: Number, default: 0 },
    },
    default: { inicial: 0, final: 0 },
  })
  entregasEfectivo: { inicial: number; final: number };

  @Prop({
    type: [
      {
        tipo: {
          type: String,
          enum: ['venta', 'compra', 'egreso', 'ingreso', 'ajuste'],
        },
        descripcion: String,
        metodo: {
          type: String,
          enum: [
            'efectivo',
            'tarjeta',
            'cheque',
            'transferencia',
            'cuenta_corriente',
          ],
        },
        monto: { type: Number, default: 0 },
        fecha: Date,
        referenciaId: { type: Types.ObjectId },
        userId: { type: Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
  })
  movimientos: any[];

  @Prop({
    type: {
      balanceFinal: { type: Number, default: 0 },
      efectivoTotalSistema: { type: Number, default: 0 },
      efectivoTotalPresentado: { type: Number, default: 0 },
    },
    default: {
      balanceFinal: 0,
      efectivoTotalSistema: 0,
      efectivoTotalPresentado: 0,
    },
  })
  arqueoFinal: {
    balanceFinal: number;
    efectivoTotalSistema: number;
    efectivoTotalPresentado: number;
  };

  @Prop({ default: Date.now })
  actualizadoEn: Date;
}

export const CajaSchema = SchemaFactory.createForClass(Caja);

CajaSchema.index({ shopId: 1 });