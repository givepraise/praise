import { UtilsProvider } from '@/utils/utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstantsProvider } from '@/constants/constants.provider';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PeriodSettingsModule } from 'src/periodsettings/periodsettings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    PeriodSettingsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, UtilsProvider, ConstantsProvider],
})
export class SettingsModule {}
