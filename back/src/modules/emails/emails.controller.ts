import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailsService } from './emails.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

 
  @UseInterceptors(FileInterceptor('file'))
  @Post('/post/send-ticket')
  async sendTicketEmail(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      email: string;
      subject: string;
      businessName?: string;
      total?: string;
      date?: string;
      paymentSummary?: string; // JSON.stringify()
    },
  ) {
    return this.emailsService.sendTicketByEmailWithAttachment(
      body.email,
      body.subject,
      file,
      body.businessName,
      parseFloat(body.total || '0'),
      body.paymentSummary ? JSON.parse(body.paymentSummary) : [],
      body.date,
    );
  }

  @Public()
  @Post('/post/send-reset-password-email')
  async sendResetPasswordEmail(
    @Query('to') to: string,
    @Query('resetCode') resetCode: string,
  ) {
    return this.emailsService.sendPasswordResetEmail(to, resetCode);
  }

  @Post('/post/send-welcome-email')
  async sendWelcomeEmail(
    @Query('to') to: string,
    @Query('userName') userName: string,
    @Query('userEmail') userEmail: string,
  ) {
    return this.emailsService.sendWelcomeEmail(to, userName, userEmail);
  }

  @Post('/post/send-order-confirmation')
  async sendOrderConfirmationEmail(
    @Body()
    body: {
      shopId: string;
      deliveryType: string; // 'Delivery' | 'Retiro'
      paymentType: string; // 'Presencial' | 'Mercado Pago'
      total: number;
      saleId: string;
      email: string;
      client: {
        name: string;
        phone: string;
        email: string;
        address: string;
        city: string;
        postalCode: string;
      };
      productDetails: Array<{
        name: string;
        quantity: number;
        sellPrice: number;
        variants?: Array<{
          size?: string;
          color?: string;
          quantity: number;
        }>;
      }>;
      shop: {
        name: string;
        address: string;
        phone: string;
        email: string;
      };
    },
  ) {
    const orderData = {
      email: body.email,
      shopId: body.shopId,
      deliveryType: body.deliveryType as 'Delivery' | 'Retiro',
      paymentType: body.paymentType as 'Presencial' | 'Mercado Pago',
      total: body.total,
      saleId: body.saleId,
      client: body.client,
      productDetails: body.productDetails,
      shop: body.shop,
    };

    return this.emailsService.sendOrderConfirmationEmail(orderData);
  }

  //Enviar codigo de validacion de email
  @Public()
  @Post('/post/send-email-verification')
  async sendEmailVerification(
    @Query('to') to: string,
    @Query('verificationCode') verificationCode: string,
  ) {
    return this.emailsService.sendEmailVerificationToken(to, verificationCode);
  }


  // Enviar resumen diario de ventas, compras, gastos e ingresos
  @Post('/post/send-daily-summary')
  async sendDailySummary(
    @Body()
    body: {
      to: string;
      shopName: string;
      reportData: {
        totals: {
          sales: number;
          purchases: number;
          expenses: number;
          incomes: number;
        };
        salesByPaymentMethodTotals: Record<string, number>;
        expensesByPaymentMethodTotals: Record<string, number>;
        purchasesByPaymentMethodTotals: Record<string, number>;
        incomesByPaymentMethodTotals: Record<string, number>;
      };
      date?: string;
    },
  ) {
    const date = body.date ? new Date(body.date) : new Date();

    return await this.emailsService.sendDailyBusinessSummary(
      body.to,
      body.reportData,
      date,
    );
  }
}
