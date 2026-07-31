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
  Request,
} from '@nestjs/common';
import { TurnsService } from './turns.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlanGuard } from 'src/guards/plan.guard';
import { TurnsEnabledGuard } from 'src/guards/turns-enabled.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';
import { CreateTurnDto, CloseTurnDto } from './dto/turns.dto';

@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(ShopPlanEnum.MEDIUM)
@Controller('turns')
export class TurnsController {
  constructor(private readonly turnsService: TurnsService) {}

  @Post()
  @UseGuards(TurnsEnabledGuard)
  async create(@Request() req, @Body() body: CreateTurnDto) {
    return this.turnsService.openTurn({ ...body, userId: req.user.id });
  }

  @Put('/close')
  @UseGuards(TurnsEnabledGuard)
  async closeTurn(@Request() req, @Body() body: CloseTurnDto) {
    return this.turnsService.closeTurn({ ...body, userId: req.user.id });
  }

  @Get('/get/turn/sales/:userId')
  async getSalesToShow(@Param('userId') userId: string) {
    return this.turnsService.getSalestoShow(userId);
  }

  /** Turnos del shop con filtros opcionales de fecha y usuario */
  @Get('/get/shop-turns')
  async getShopTurns(
    @Request() req,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('minSales') minSales?: string,
    @Query('maxSales') maxSales?: string,
  ) {
    return this.turnsService.getShopTurns(
      req.user.shopId.toString(),
      dateFrom,
      dateTo,
      userId,
      status,
      minSales !== undefined ? Number(minSales) : undefined,
      maxSales !== undefined ? Number(maxSales) : undefined,
    );
  }

  @Get()
  findAll() {
    return this.turnsService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.turnsService.getUserOpenTurn(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTurnDto) {
    return this.turnsService.update(id, updateTurnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.turnsService.remove(id);
  }
}
