import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class UserPermissions extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId; // ← a qué kiosco pertenece

  @Prop({ required: true })
  userId: string; // ID del usuario

  @Prop({ required: true })
  routes: string[]; // Array de rutas permitidas
}

export const UserPermissionsSchema =
  SchemaFactory.createForClass(UserPermissions);

UserPermissionsSchema.index({ shopId: 1 });
