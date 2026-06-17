import { Module } from '@nestjs/common';
import { SupplierPaymentsService } from './supplier-payments.service';
import { SupplierPaymentsController } from './supplier-payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierPayments, SupplierPaymentsSchema } from './supplier-payments.schema';
import { Suppliers, SuppliersSchema } from '../suppliers/supplier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplierPayments.name, schema: SupplierPaymentsSchema },
      { name: Suppliers.name, schema: SuppliersSchema },
    ]),
  ],
  controllers: [SupplierPaymentsController],
  providers: [SupplierPaymentsService],
})
export class SupplierPaymentsModule {}
