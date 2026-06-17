import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  async findOrCreate(shopId: string): Promise<Settings> {
    const existing = await this.settingsModel.findOne({ shopId });
    if (existing) return existing;
    return this.settingsModel.create({ shopId });
  }

  async update(shopId: string, dto: UpdateSettingsDto): Promise<Settings> {
    return this.settingsModel.findOneAndUpdate(
      { shopId },
      { $set: dto },
      { upsert: true, new: true },
    );
  }
}
