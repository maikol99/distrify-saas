import { Controller, Post, Query, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OutputsService } from './outputs.service';
import { CreateOutputDto, UpdateOutputDto } from './dto/outputs.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlanGuard } from 'src/guards/plan.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';

@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(ShopPlanEnum.BASIC)
@Controller('outputs')
export class OutputsController {
  constructor(private readonly outputsService: OutputsService) {}

  //?Crear un egreso
  @Post('/post/create-output')
  async createOutput(@Request() req, @Body() createOutputDto: CreateOutputDto) {
    return this.outputsService.createOutput({ ...createOutputDto, userId: req.user.id });
  }

  //?Obtener todos los egresos con paginacion
  @Get('/get/all-outputs')
  async getOutputs(@Query('shopId') shopId: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.outputsService.getOutputs(shopId, page, limit);
  }

  //?Obtener egresos segun filtros complejos
  @Get('/get/outputs-filtered')
  async getOutputsWithFilter(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('userId') userId: string,
    @Query('category') category: string,
    @Query('paymentMethod') paymentMethod: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
  ) {
    return this.outputsService.getOutputsWithFilter(
      shopId,
      page,
      limit,
      userId,
      startDate,
      endDate,
      category,
      paymentMethod,
      minAmount ? Number(minAmount) : undefined,
      maxAmount ? Number(maxAmount) : undefined,
    );
  }

  //? Obtener un egreso por ID
  @Get('/get/get-by-id/:id')
  async getOutputById(@Param('id') id: string) {
    return this.outputsService.getOutputById(id);
  }

  //? Actualizar un egreso por ID (PATCH)
  @Patch('/patch/update-output/:id')
  async updateOutput(
    @Param('id') id: string,
    @Body() updateOutputDto: UpdateOutputDto,
  ) {
    return this.outputsService.updateOutput(id, updateOutputDto);
  }

  //? Eliminar un egreso por ID
  @Delete('/delete/delete-output/:id')
  async deleteOutput(@Param('id') id: string) {
    return this.outputsService.deleteOutput(id);
  }
}
