import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ProductsService } from '../products/products.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PlanGuard } from 'src/guards/plan.guard';
import { RequirePlan } from 'src/decorators/plan.decorator';
import { ShopPlanEnum } from 'src/modules/shops/enum/shops.enum';

@UseGuards(JwtAuthGuard, PlanGuard)
@RequirePlan(ShopPlanEnum.MEDIUM)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Obtener reporte completo de negocio
   * @param shopId ID de la tienda
   * @param startDate Fecha de inicio (opcional)
   * @param endDate Fecha de fin (opcional)
   * @returns Reporte completo con ventas, compras, gastos e ingresos
   */
  @Get('/get/business-report')
  async getBusinessReport(
    @Query('shopId') shopId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId es requerido');
    }

    // Convertir strings de fecha a objetos Date si se proporcionan
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new BadRequestException('startDate debe ser una fecha válida');
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('endDate debe ser una fecha válida');
      }
      // Ajustar endDate al final del día
      parsedEndDate.setHours(23, 59, 59, 999);
    }

    return await this.reportsService.getBusinessReport(
      shopId,
      parsedStartDate,
      parsedEndDate,
    );
  }
}