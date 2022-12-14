import { UtilsProvider } from '@/utils/utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstantsProvider } from '@/constants/constants.provider';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    PeriodSettingsModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, UtilsProvider, ConstantsProvider],
  exports: [
    SettingsService,
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
})
export class SettingsModule {}
