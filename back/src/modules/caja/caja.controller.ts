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
import { CajaService } from './caja.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateCajaDto } from './dto/caja.dto';
import { PlanGuard } from 'src/guards/plan.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';

@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(ShopPlanEnum.MEDIUM)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  //?Abrir caja
  @Post('/post/open-caja')
  async openCaja(@Body() createCajaDto: CreateCajaDto) {
    return await this.cajaService.openCaja(createCajaDto);
  }

  //?Cerrar caja
  @Patch('/patch/close-caja')
  async closeCaja(@Body() body: any) {
    return await this.cajaService.closeCaja(body);
  }

  //?Registrar movimiento en caja
  @Patch('/patch/register-movement')
  async registerMovement(@Body() body: any) {
    return await this.cajaService.registerMovement(body);
  }

  //?Traer todas las cajas de un negocio con paginación
  @Get('/get/get-cajas/:shopId')
  findAll(
    @Param('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.cajaService.findAll(shopId, page, limit);
  }

  //?Obtener una caja y su summary
  @Get('/get/get-caja-summary/:cajaId')
  async getCaja(@Param('cajaId') cajaId: string) {
    return await this.cajaService.getCajaSummary(cajaId);
  }

  //Filtrar cajas
  @Get('/get/filter-cajas/:shopId')
  async filterCajas(
    @Param('shopId') shopId: string,
    @Query('title') title: string,
    @Query('estado') estado: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('createdBy') createdBy?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('isAutomatic') isAutomatic?: string,
  ) {
    return await this.cajaService.filterCajas(
      shopId,
      title,
      estado,
      startDate,
      endDate,
      page,
      limit,
      createdBy,
      minAmount ? Number(minAmount) : undefined,
      maxAmount ? Number(maxAmount) : undefined,
      isAutomatic,
    );
  }

  //ELiminar caja
  @Delete('/delete/delete-caja/:cajaId')
  async deleteCaja(@Param('cajaId') cajaId: string) {
    return await this.cajaService.deleteCaja(cajaId);
  }
}
