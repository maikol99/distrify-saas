import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Headers,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Public } from 'src/decorators/public.decorator';

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/post/link-account')
  async linkAccount(@Body() body: { shopId: string; accessToken: string }) {
    return await this.mercadoPagoService.linkAccount(body.shopId, body.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/unlink-account')
  async unlinkAccount(@Query('shopId') shopId: string) {
    return await this.mercadoPagoService.unlinkAccount(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/get-access-token')
  async getAccessToken(@Query('shopId') shopId: string) {
    return await this.mercadoPagoService.getAccessToken(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post/create-order')
  async createOrder(
    @Body() body: { shopId: string; products: any[]; total: number },
  ) {
    return await this.mercadoPagoService.createNewOrder(body);
  }

  // Webhooks son públicos — los llama MercadoPago, no el usuario
  @Public()
  @Post('webhook/:shopId')
  async webhookByShop(
    @Param('shopId') shopId: string,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.mercadoPagoService.validateWebhookSignature(headers, body);
    return await this.mercadoPagoService.webhookByShop(shopId, body);
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    this.mercadoPagoService.validateWebhookSignature(headers, body);
    return await this.mercadoPagoService.webhookOptimized(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('webhook-config/:shopId')
  async getWebhookConfig(@Param('shopId') shopId: string) {
    return await this.mercadoPagoService.getWebhookConfig(shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-webhook/:shopId')
  async testWebhook(
    @Param('shopId') shopId: string,
    @Body() mockData: { paymentId: string },
  ) {
    return await this.mercadoPagoService.testWebhook(shopId, mockData);
  }
}
