import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlanGuard } from 'src/guards/plan.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ProductRangeEnum,
  ProductUpdateActionEnum,
  ProductUpdateTypeEnum,
} from './product.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('post/create-product')
  async create(@Body() body) {
    return await this.productsService.create(body);
  }

  @Get('get/get-products/:shopId')
  async findAll(
    @Param('shopId') shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('stockLevel') stockLevel?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minBuyPrice') minBuyPrice?: string,
    @Query('maxBuyPrice') maxBuyPrice?: string,
    @Query('expirationFrom') expirationFrom?: string,
    @Query('expirationTo') expirationTo?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
  ) {
    const pageNumber = isNaN(Number(page)) ? undefined : parseInt(page, 10);
    const limitNumber = isNaN(Number(limit)) ? undefined : parseInt(limit, 10);

    return await this.productsService.findAll(
      shopId,
      pageNumber,
      limitNumber,
      search,
      location,
      stockLevel,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      minBuyPrice ? Number(minBuyPrice) : undefined,
      maxBuyPrice ? Number(maxBuyPrice) : undefined,
      expirationFrom,
      expirationTo,
      createdFrom,
      createdTo,
      minStock ? Number(minStock) : undefined,
      maxStock ? Number(maxStock) : undefined,
    );
  }
  @Get('get/get-by-category/:category')
  async getProductsByCategory(
    @Param('category') category: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = isNaN(Number(page)) ? undefined : parseInt(page, 10);
    const limitNumber = isNaN(Number(limit)) ? undefined : parseInt(limit, 10);

    return await this.productsService.getProductsByCategory(
      category,
      pageNumber,
      limitNumber,
    );
  }

  //Buscar por nombre
  @Get('get/search-product/:shopId')
  async searchProduct(
    @Query('name') name: any,
    @Param('shopId') shopId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.productsService.searchProduct(name, shopId, page, limit);
  }

  //Buscar por codigo
  @Get('get/search-product-by-code/:shopId')
  async searchProductByCode(
    @Query('code') code: any,
    @Param('shopId') shopId: string,
  ) {
    return await this.productsService.searchProductByCode(code, shopId);
  }

  //Filtrar productos
  @Get('get/get-product/:id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch('patch/update-product/:id')
  async update(@Param('id') id: string, @Body() body) {
    return this.productsService.update(id, body);
  }

  @Delete('delete/delete-product/:id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  //Cargar imagen
  @Post('/post/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.productsService.uploadImage(file);
  }

  //Eliminar imagen
  @Delete('/delete/delete-image/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return await this.productsService.deleteImage(publicId);
  }

  //?Filtrar productos por filtros
  @Get('get/filter-products')
  async filterProducts(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('categoryId') categoryId: string,
    @Query('supplierId') supplierId: string,
    @Query('maxAmount') maxAmount: string,
    @Query('minAmount') minAmount: string,
    @Query('name') name: string,
    @Query('location') location?: string,
    @Query('stockLevel') stockLevel?: string,
    @Query('minBuyPrice') minBuyPrice?: string,
    @Query('maxBuyPrice') maxBuyPrice?: string,
    @Query('expirationFrom') expirationFrom?: string,
    @Query('expirationTo') expirationTo?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
    @Query('code') code?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return await this.productsService.filterProducts(
      shopId,
      page,
      limit,
      categoryId,
      supplierId,
      maxAmount ? Number(maxAmount) : undefined,
      minAmount ? Number(minAmount) : undefined,
      name,
      location,
      stockLevel,
      minBuyPrice ? Number(minBuyPrice) : undefined,
      maxBuyPrice ? Number(maxBuyPrice) : undefined,
      expirationFrom,
      expirationTo,
      minStock ? Number(minStock) : undefined,
      maxStock ? Number(maxStock) : undefined,
      code,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    );
  }

  @Delete('delete/delete-multiple-products')
  async deleteMultipleProducts(@Body('productIds') productIds: string[]) {
    return await this.productsService.deleteMultipleProducts(productIds);
  }

  //Actualizar producto por porcentaje
  @Patch('/patch/update-multiple-products/by-percentage')
  async updateMultipleProductsByPercentage(
    @Body()
    body: {
      shopId: string;
      range: ProductRangeEnum;
      type: ProductUpdateTypeEnum;
      percentage: number;
      action: ProductUpdateActionEnum;
      categoryId?: string;
    },
  ) {
    return await this.productsService.updatePricesByPercentage(
      body.shopId,
      body.range,
      body.type,
      body.percentage,
      body.action,
      body.categoryId,
    );
  }

  //Eliminar productos por categoria
  @Delete('delete/delete-products-by-category')
  async deleteProductsByCategory(
    @Query('shopId') shopId: string,
    @Query('categoryId') categoryId: string,
  ) {
    return await this.productsService.deleteProductsByCategory(
      shopId,
      categoryId,
    );
  }

  // Transferir stock entre local y depósito
  @UseGuards(JwtAuthGuard)
  @Post('post/transfer-stock')
  async transferStock(
    @Body()
    body: {
      shopId: string;
      productId: string;
      from: 'local' | 'depot';
      to: 'local' | 'depot';
      quantity: number;
    },
  ) {
    return await this.productsService.transferStock(
      body.shopId,
      body.productId,
      body.from,
      body.to,
      body.quantity,
    );
  }

  // Obtener valor total del stock
  @Get('get/stock-value/:shopId')
  async getStockValue(
    @Param('shopId') shopId: string,
    @Query('location') location?: string,
  ) {
    return await this.productsService.getStockValue(shopId, location);
  }

  // Actualizar productos por monto fijo ($)
  @UseGuards(JwtAuthGuard)
  @Patch('/patch/update-multiple-products/by-fixed-amount')
  async updateMultipleProductsByFixedAmount(
    @Body()
    body: {
      shopId: string;
      range: ProductRangeEnum;
      type: ProductUpdateTypeEnum;
      amount: number;
      action: ProductUpdateActionEnum;
      categoryId?: string;
    },
  ) {
    return await this.productsService.updatePricesByFixedAmount(
      body.shopId,
      body.range,
      body.type,
      body.amount,
      body.action,
      body.categoryId,
    );
  }
}
