import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('create')
  async create(@Body() body: any) {
    return await this.promotionsService.create(body);
  }

  @Get('get/:shopId')
  async findAll(
    @Param('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('isActive') isActive?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return await this.promotionsService.findAll(
      shopId, page, limit, isActive, type, startDate, endDate, search,
    );
  }

  @Get('get-by-id/:id')
  async findOne(@Param('id') id: string) {
    return await this.promotionsService.findOne(id);
  }

  @Get('active/:shopId')
  async getActive(@Param('shopId') shopId: string) {
    return await this.promotionsService.getActive(shopId);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.promotionsService.update(id, body);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.promotionsService.remove(id);
  }
}
