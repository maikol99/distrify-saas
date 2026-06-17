import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/get/my-settings')
  getMySettings(@Request() req) {
    return this.settingsService.findOrCreate(req.user.shopId);
  }

  @Patch('/patch/update-settings')
  updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(req.user.shopId, dto);
  }
}
