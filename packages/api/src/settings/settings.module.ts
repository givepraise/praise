import { FileUtilsProvider } from '../settings/providers/file-utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstantsProvider } from '../constants/constants.provider';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { EventLogModule } from '../event-log/event-log.module';
import { Period, PeriodSchema } from '../periods/schemas/periods.schema';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setting.name, schema: SettingSchema },
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
      { name: Period.name, schema: PeriodSchema },
    ]),
    EventLogModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, FileUtilsProvider, ConstantsProvider],
  exports: [SettingsService],
})
export class SettingsModule {}
