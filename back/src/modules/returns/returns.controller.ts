import { Controller } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { Body, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

// returns.controller.ts
@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post('/process/full-return')
  async processFullReturn(@Body() body: any) {
    return this.returnsService.processFullReturn(
      body.saleId,
      body.refundType,
      body.reason,
      body.processedBy,
      body.notes,
    );
  }

  @Post('/process/partial-return')
  async processPartialReturn(@Body() body: any) {
    return this.returnsService.processPartialReturn(
      body.saleId,
      body.productsToReturn,
      body.refundType,
      body.reason,
      body.processedBy,
      body.notes,
    );
  }

  @Post('/process/exchange')
  async processExchange(@Body() body: any) {
    return this.returnsService.processExchange(
      body.saleId,
      body.productsToReturn,
      body.newProducts,
      body.reason,
      body.processedBy,
      body.cashier,
      body.notes,
    );
  }

  @Get('/get/by-sale/:saleId')
  async getReturnsBySale(@Param('saleId') saleId: string) {
    return this.returnsService.getReturnsBySale(saleId);
  }

  @Get('/get/by-shop/:shopId')
  async getReturnsByShop(
    @Param('shopId') shopId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.returnsService.getReturnsByShop(shopId, page, limit);
  }
}
