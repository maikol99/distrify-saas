import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get('get/:shopId')
  async findAll(
    @Param('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('productId') productId?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('fromLocation') fromLocation?: string,
    @Query('toLocation') toLocation?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return await this.stockMovementsService.findAll(
      shopId,
      page,
      limit,
      productId,
      search,
      type,
      fromLocation,
      toLocation,
      startDate,
      endDate,
      userId,
    );
  }

  @Get('get/product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('shopId') shopId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.stockMovementsService.findByProduct(productId, shopId, page, limit);
  }
}
