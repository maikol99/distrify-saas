import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto } from './dto/shops.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  //Crear un nuevo negocio
  @Post('/post/create-shop')
  async createShop(@Body() body: CreateShopDto) {
    return await this.shopsService.createShop(body);
  }

  //Obtener todos los negocios
  @UseGuards(JwtAuthGuard)
  @Get('/get/get-all-shops')
  async getAllShops(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.shopsService.getAllShops(page, limit);
  }

  //Obtener un negocio por id
  @Get('/get/get-shop-by-id/:id')
  async getShopById(@Param('id') id: string) {
    return await this.shopsService.getShopById(id);
  }

  //Eliminar un negocio por id
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/delete-shop-by-id/:id')
  async deleteShopById(@Param('id') id: string) {
    return await this.shopsService.deleteShop(id);
  }

  //Actualizar un negocio por id
  @UseGuards(JwtAuthGuard)
  @Patch('/patch/update-shop-by-id/:id')
  async updateShopById(@Param('id') id: string, @Body() body: UpdateShopDto) {
    return await this.shopsService.updateShop(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/verify-shop-phone/:shopId')
  async verifyShopPhone(@Param('shopId') shopId: string) {
    return await this.shopsService.checkShopPhone(shopId);
  }

}
