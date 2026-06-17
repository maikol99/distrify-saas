import { Controller, Post, Get, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ClientPaymentsService } from './client-payments.service';
import { ClientPaymentsDto } from './dto/client-payments.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('client-payments')
export class ClientPaymentsController {
  constructor(private readonly clientPaymentsService: ClientPaymentsService) {}

  // Crear pago
  @Post('/post/create-payment')
  async createPayment(@Body() body: ClientPaymentsDto) {
    return this.clientPaymentsService.createPayment(body);
  }

  // Obtener todos los pagos de un cliente con paginación
  @Get('/get/client-payments/:clientId')
  async getAllPaymentsByClient(
    @Param('clientId') clientId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.clientPaymentsService.getAllPaymentsByClient(clientId, page, limit);
  }

  // Obtener pagos vinculados a una venta
  @Get('/get/payments-by-sale/:saleId')
  async getPaymentsBySale(@Param('saleId') saleId: string) {
    return this.clientPaymentsService.getPaymentsBySale(saleId);
  }

  // Obtener un pago por ID
  @Get('/get/payment/:id')
  async getPaymentById(@Param('id') id: string) {
    return this.clientPaymentsService.getPaymentById(id);
  }

  // Actualizar un pago
  @Put('/put/update-payment/:id')
  async updatePayment(
    @Param('id') id: string,
    @Body() body: Partial<ClientPaymentsDto>,
  ) {
    return this.clientPaymentsService.updatePayment(id, body);
  }

  // Eliminar un pago
  @Delete('/delete/payment/:id')
  async deletePayment(@Param('id') id: string) {
    return this.clientPaymentsService.deletePayment(id);
  }
}
