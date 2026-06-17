import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PedidosPaymentEnum, PedidosStatusEnum, PedidoTypeEnum } from './enum/pedidos.enum';


@Controller('orders')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) { }

  //Crear un pedido
  @Post('/post/create-order')
  async createPedido(@Body() body: any) {
    return this.pedidosService.createPedido(body);
  }

  //Traer pedidos de negocio con paginacion
@UseGuards(JwtAuthGuard)

  @Get('/get/business-orders')
  async getPedidosNegocio(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.pedidosService.getPedidosNegocio(shopId, page, limit);
  }

  // Obtener un pedido por ID
  
  @Get('/get/get-by-id/:id')
  async getPedidoById(@Param('id') id: string) {
    return this.pedidosService.getPedidoById(id);
  }

  // Actualizar un pedido (solo el negocio autenticado)
  @UseGuards(JwtAuthGuard)
  @Put('/update/:id')
  async updatePedido(@Param('id') id: string, @Body() body: any) {
    return this.pedidosService.updatePedido(id, body);
  }


  // Eliminar un pedido
@UseGuards(JwtAuthGuard)

  @Delete('/delete/:id')
  async deletePedido(@Param('id') id: string) {
    return this.pedidosService.deletePedido(id);
  }


  //Filtrar pedidos con paginacion
@UseGuards(JwtAuthGuard)

  @Get('/get/filter-pedidos')
  async filterPedidos(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('deliveryType') deliveryType?: PedidoTypeEnum,
    @Query('status') status?: PedidosStatusEnum,
    @Query('paymentStatus') paymentStatus?: PedidosPaymentEnum,
    @Query('paymentType') paymentType?: PedidosPaymentEnum,
  ) {
    return this.pedidosService.filterPedidos(shopId, page, limit, startDate, endDate, deliveryType, status, paymentStatus, paymentType);
  }


}
