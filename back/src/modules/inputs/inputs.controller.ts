import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InputsService } from './inputs.service';
import { CreateInputDto, UpdateInputDto } from './dto/inputs.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlanGuard } from 'src/guards/plan.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';

@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(ShopPlanEnum.BASIC)
@Controller('inputs')
export class InputsController {
  constructor(private readonly inputsService: InputsService) {}

  //? Crear un ingreso
  @Post('/post/create-input')
  async createInput(@Request() req, @Body() createInputDto: CreateInputDto) {
    return this.inputsService.createInput({ ...createInputDto, userId: req.user.id });
  }

  //? Obtener todos los ingresos con paginación
  @Get('/get/all-inputs')
  async getInputs(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.inputsService.getInputs(shopId, page, limit);
  }

  //? Obtener ingresos según filtros complejos
  @Get('/get/inputs-filtered')
  async getInputsWithFilter(
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
    return this.inputsService.getInputsWithFilter(
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

  //? Obtener un ingreso por ID
  @Get('/get/get-by-id/:id')
  async getInputById(@Param('id') id: string) {
    return this.inputsService.getInputById(id);
  }

  //? Actualizar un ingreso por ID
  @Patch('/patch/update-input/:id')
  async updateInput(
    @Param('id') id: string,
    @Body() updateInputDto: UpdateInputDto,
  ) {
    return this.inputsService.updateInput(id, updateInputDto);
  }

  //? Eliminar un ingreso por ID
  @Delete('/delete/delete-input/:id')
  async deleteInput(@Param('id') id: string) {
    return this.inputsService.deleteInput(id);
  }
}
