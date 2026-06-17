import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Sales } from 'src/modules/sales/sales.schema';
import { AuthorizationStatus, TypeOfClient } from './enum/clients.enum';

@Schema({
  timestamps: true,
})
export class Clients {
  @Prop({ required: true, type: Types.ObjectId })
  shopId: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: number;

  @Prop()
  email: string;



  @Prop({
    type: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true, default: Date.now },
        description: { type: String, required: true },
      },
    ],
    default: [],
  })
  payments: { amount: number; date: Date; description: string }[];

  @Prop()
  debt: number;

  @Prop({ type: String, enum: TypeOfClient })
  typeOfClient: TypeOfClient;

  @Prop({ enum: AuthorizationStatus })
  isAuthorized: AuthorizationStatus;

  @Prop()
  clientList: string;
}

export const ClientsSchema = SchemaFactory.createForClass(Clients);
