import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  //?Crear nueva categoria
  @UseGuards(JwtAuthGuard)
  @Post('/post/create-category')
  async createCategory(@Body() body: any) {
    return this.categoriesService.createCategory(body);
  }

  //?Obtener todas las categorias
  @UseGuards(JwtAuthGuard)
  @Get('/get/get-all-categories')
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  //?Obtener categoria por ID
  @UseGuards(JwtAuthGuard)
  @Get('/get/get-category-by-id/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  //?Obtener categorias por shopId
  @Get('/get/get-categories-by-shop/:shopId')
  async getCategoriesByShopId(
    @Param('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const pageNumber = page ? parseInt(page.toString(), 10) : 1;

    const limitNumber = limit ? parseInt(limit.toString(), 10) : 10;

    return this.categoriesService.getCategoriesByShopId(
      shopId,
      pageNumber,
      limitNumber,
    );
  }

  //?Actualizar categoria
  @UseGuards(JwtAuthGuard)
  @Patch('/patch/update-category/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.updateCategory(id, body);
  }

  //?Eliminar categoria
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/delete-category/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  //?Buscar categorias por nombre
  @UseGuards(JwtAuthGuard)
  @Get('/get/search-categories-by-name')
  async searchCategoriesByName(
    @Query('name') name: string,
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const pageNumber = page ? parseInt(page.toString(), 10) : 1;
    const limitNumber = limit ? parseInt(limit.toString(), 10) : 10;

    return this.categoriesService.searchCategoriesByName(
      name,
      shopId,
      pageNumber,
      limitNumber,
    );
  }
}
