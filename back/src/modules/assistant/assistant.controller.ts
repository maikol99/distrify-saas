import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssistantService } from './assistant.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Shops } from '../shops/shops.schema';
import { ShopPlanEnum } from '../shops/enum/shops.enum';

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @Request() req,
    @Body() body: { message: string; chatHistory?: any[] },
  ) {
    const shopId = req.user.shopId;

    const shop = await this.shopsModel.findById(shopId).select('plan').lean();
    if (!shop || shop.plan !== ShopPlanEnum.PREMIUM) {
      throw new ForbiddenException('El asistente IA está disponible solo en el plan Premium.');
    }

    return this.assistantService.chat(
      body.message,
      shopId,
      body.chatHistory ?? [],
    );
  }
}
