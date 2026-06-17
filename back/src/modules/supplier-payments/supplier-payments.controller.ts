import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SupplierPaymentsService } from './supplier-payments.service';
import { SupplierPaymentsDto } from './dto/supplier-payments.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, )
@Controller('supplier-payments')
export class SupplierPaymentsController {
  constructor(
    private readonly supplierPaymentsService: SupplierPaymentsService,
  ) {}

  // Crear pago
  @Post('/post/create-payment')
  async createPayment(@Body() body: SupplierPaymentsDto) {
    return this.supplierPaymentsService.createPayment(body);
  }

  // Obtener todos los pagos de un proveedor con paginación
  @Get('/get/supplier-payments/:supplierId')
  async getAllPaymentsBySupplier(
    @Param('supplierId') supplierId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.supplierPaymentsService.getAllPaymentsBySupplier(
      supplierId,
      page,
      limit,
    );
  }

  // Obtener un pago por ID
  @Get('/get/payment/:id')
  async getPaymentById(@Param('id') id: string) {
    return this.supplierPaymentsService.getPaymentById(id);
  }

  // Actualizar un pago
  @Put('/put/update-payment/:id')
  async updatePayment(
    @Param('id') id: string,
    @Body() body: Partial<SupplierPaymentsDto>,
  ) {
    return this.supplierPaymentsService.updatePayment(id, body);
  }

  // Eliminar un pago
  @Delete('/delete/payment/:id')
  async deletePayment(@Param('id') id: string) {
    return this.supplierPaymentsService.deletePayment(id);
  }
}
