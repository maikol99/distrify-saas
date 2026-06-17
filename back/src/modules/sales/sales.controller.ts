/* eslint-disable */
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
  Res,
  HttpStatus,
  HttpException,
  Put,
  Req,
  Request,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { SaleStatusEnum } from './enum/sales.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ConfigService } from '@nestjs/config';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('crear/qr')
  async generateQR(@Res() res: Response, @Body() body: { total: number }) {
    const collectorId = this.configService.get<string>('MERCADOPAGO_COLLECTOR_ID');
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    const url = `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${collectorId}/pos/EXTID001/qrs`;

    const data = {
      title: 'Prueba QR',
      total_amount: body.total,
      items: [
        {
          sku_number: 'A123K9191938',
          category: 'marketplace',
          title: 'Ventas',
          description: 'Pago realizado con QR',
          unit_price: body.total,
          quantity: 1,
          unit_measure: 'unit',
          total_amount: body.total,
        },
      ],
      external_reference: '1',
      description: 'Pago con QR',
    };

    try {
      const mpResponse = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      if (!mpResponse.data.qr_data) {
        throw new HttpException(
          'No se recibieron datos del QR desde Mercado Pago',
          HttpStatus.BAD_REQUEST,
        );
      }

      const qrImage = await QRCode.toBuffer(mpResponse.data.qr_data, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
      });

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="qr.png"',
        'Cache-Control': 'no-cache',
      });

      return res.send(qrImage);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: true,
        message: 'Error al generar QR en Mercado Pago',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/generar-orden-mp')
  async generateOrderMP(@Body() body: any) {
    try {
      const client = new MercadoPagoConfig({
        accessToken: this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN'),
        options: { timeout: 5000 },
      });
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              title: body.title || 'Orden de pago de Mercado Pago',
              quantity: body.quantity || 1,
              description: body.description || 'No posee descripcion',
              unit_price: body.total,
              id: body.id || '0001',
              currency_id: 'ARS',
            },
          ],
          back_urls: {
            success: this.configService.get<string>('FRONTEND_URL') + '/pago-exitoso',
            failure: this.configService.get<string>('FRONTEND_URL') + '/pago-fallido',
            pending: this.configService.get<string>('FRONTEND_URL') + '/pago-pendiente',
          },
          notification_url: this.configService.get<string>('BASE_URL') + '/mercado-pago/webhook',
        },
      });
      if (result) {
        return { success: true, message: 'Orden generada con exito', data: result };
      }
    } catch (error) {
      return { success: false, message: 'Error al generar orden' };
    }
  }

  @UseGuards(JwtAuthGuard)

  // Controlador para manejar la solicitud de filtrado
  @Get('/get/filter-by-date/:shopId')
  async filtrarPorFecha(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const inicio = new Date(startDate);
      const final = new Date(endDate);

      // Verifica si las fechas son válidas
      if (isNaN(inicio.getTime()) || isNaN(final.getTime())) {
        throw new Error('Fechas inválidas');
      }

      return this.salesService.filterSales(shopId, inicio, final);
    } catch (error) {
      // Maneja el error y proporciona una respuesta adecuada
      return { error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/post/create-sale')
  create(@Request() req, @Body() createSaleDto) {
    return this.salesService.create({ ...createSaleDto, userId: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/get-sales/:shopId')
  findAll(
    @Param('shopId') shopId: string,
    @Query('page') page: number,

    @Query('limit') limit: number,
  ) {
    return this.salesService.findAll(shopId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/get-sale/by-id/:id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/patch/update-sale/:id')
  update(@Param('id') id: string, @Body() updateSaleDto) {
    return this.salesService.update(id, updateSaleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/delete-sale/:id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/sales-products/:shopId')
  async getProducts(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.getSalesProducts(shopId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/patch/cancel-sale')
  async cancelSale(@Query('saleId') saleId) {
    return await this.salesService.cancelSale(saleId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/patch/change-sale/item')
  async changeSaleItem(
    @Query('saleId') saleId: string,
    @Query('oldProductId') oldProductId: string,
    @Query('newProductId') newProductId: string,
  ) {
    return await this.salesService.changeSaleItem(
      saleId,
      oldProductId,
      newProductId,
    );
  }

  //Obtener ventas por cliente
  @UseGuards(JwtAuthGuard)
  @Get('/get/sales-by-client/:clientId')
  async getSalesByClient(
    @Param('clientId') clientId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.salesService.getSalesByClient(clientId, page, limit);
  }

  @UseGuards(JwtAuthGuard)

  //Obtener ventas con filtrado complejo
  @Get('/get/sales-with-filter/:shopId')
  async getSalesWithFilter(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('clientId') clientId?: string,
    @Query('cashier') cashier?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('productId') productId?: string,
    @Query('hasDiscount') hasDiscount?: string,
    @Query('saleId') saleId?: string,
  ) {
    const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
    const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return await this.salesService.getSalesWithFilter(
      shopId,
      startDateObj,
      endDateObj,
      clientId,
      cashier,
      paymentMethod,
      status as SaleStatusEnum,
      pageNumber,
      limitNumber,
      minAmount ? Number(minAmount) : undefined,
      maxAmount ? Number(maxAmount) : undefined,
      productId,
      hasDiscount,
      saleId,
    );
  }
}
