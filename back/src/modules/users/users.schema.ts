import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserDepartmentEnum, UserRolesEnum } from './enums/users.enums';

// Definir las rutas por defecto como constante
const DEFAULT_ROUTES_ALLOWED = [
  'ventas',
  'proveedores',
  'inventario',
  'categorias',
  'compras',
  'clientes',
  'historial/ventas',
  'pedidos',
  'caja',
  'configuracion',
  'egresos',
  'ingresos',
  'reportes',
  'notificaciones',
  'asistente',
  'promociones',
  'movimientos-stock',
  'movimientos',
  'turnos',
  'sucursales',
];

@Schema({
  timestamps: true,
})
export class Users extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: UserRolesEnum,
    default: UserRolesEnum.USER,
  })
  role: UserRolesEnum;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  lastLogin: Date;

  @Prop({ required: true, default: false })
  isEmailVerified: boolean;

  @Prop()
  verificationToken: string;

  @Prop()
  verificationTokenExpires: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetTokenExpires: Date;

  @Prop({ default: null, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop({ default: null })
  isMainUser: boolean;

  @Prop({ type: [String], default: [] })
  routesProhibited: string[];

  @Prop({
    type: [String],
    default: DEFAULT_ROUTES_ALLOWED,
  })
  routesAllowed: string[];

  @Prop({ default: null })
  trialStartDate: Date;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: 0 })
  tokenVersion: number;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

UsersSchema.index({ shopId: 1 });
