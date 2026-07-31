import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateSupplierDto } from './dto/suppliers.dto';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('/post/create-supplier')
  create(@Body() createSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get('/get/all-suppliers/:shopId')
  findAll(
    @Param('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    page = Number(page);
    limit = Number(limit);

    return this.suppliersService.findAll(shopId, page, limit);
  }

  @Get('/get/get-supplier/by-id/:id')
  findOne(@Param('id') id: string): Promise<any> {
    return this.suppliersService.findOne(id);
  }

  @Patch('/patch/update-supplier/:id')
  update(@Param('id') id: string, @Body() updateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete('/delete/delete-supplier/:id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Get('/get/search-supplier/by-name')
  findByName(@Query('name') name: string, @Query('shopId') shopId: string): Promise<any> {
    return this.suppliersService.findByName(name, shopId);
  }

  //Obtener proveedores seleccionando solo nombre e id
  @Get('/get/all-suppliers-with-select/:shopId')
  findAllWithSelect(@Param('shopId') shopId: string): Promise<any> {
    return this.suppliersService.findAllNames(shopId);
  }

  //Obtener compras de un proveedor
  @Get('/get/supplier-buys/:supplierId')
  getSupplierBuys(
    @Param('supplierId') supplierId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    return this.suppliersService.getSupplierBuys(supplierId, page, limit);
  }

}
