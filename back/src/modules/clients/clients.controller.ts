import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateClientDto } from './dto/clients.dto';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('/post/create-client')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get('/get/get-clients/:id')
  findAll(
    @Param('id') shopId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('minDebt') minDebt?: number,
    @Query('maxDebt') maxDebt?: number,
    @Query('hasDebt') hasDebt?: string,
    @Query('typeOfClient') typeOfClient?: string,
    @Query('isAuthorized') isAuthorized?: string,
    @Query('clientList') clientList?: string,
  ) {
    return this.clientsService.findAll(
      shopId,
      page,
      limit,
      minDebt,
      maxDebt,
      hasDebt,
      typeOfClient,
      isAuthorized,
      clientList,
    );
  }

  @Get('/get/get-client/:id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Get('/get/by-username/:userName')
  findByUsername(@Param('userName') userName: string) {
    return this.clientsService.findByUsername(userName);
  }

  @Patch('/patch/update-client/:id')
  update(@Param('id') id: string, @Body() updateClientDto: any) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete('/delete/delete-client/:id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Put('/put/add-sale')
  addSaleToClient(
    @Body() body: { clientId: string; saleId: string; total: number },
  ) {
    return this.clientsService.addSaleToClient(body);
  }

  @Put('/put/add-pedido')
  addPedidoToClient(@Body() body: { clientId: string; pedidoId: string }) {
    return this.clientsService.addPedidoToClient(body);
  }

  @Put('/put/register-payment/:id')
  registerPayment(
    @Param('id') clientId: string,
    @Body() body: { amount: number; date?: Date; descripcion: string },
  ) {
    return this.clientsService.registerPayment(clientId, body);
  }


  //BUSCAR CLIENTES POR NOMBRE
  @Get('/get/search-client')
  searchClients(
    @Query('shopId') shopId: string,
    @Query('query') query: string,
  ) {
    return this.clientsService.searchClients(shopId, query);
  }

  //Traer clientes completos
  @Get('/get/complete-client/:id')
  getCompleteClient(@Param('id') id: string) {
    return this.clientsService.getCompleteClient(id);
  }

}
