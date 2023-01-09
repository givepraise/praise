import { UtilsProvider } from '@/utils/utils.provider';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstantsProvider } from '@/constants/constants.provider';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { EventLogModule } from '@/event-log/event-log.module';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    EventLogModule,
    forwardRef(() => PeriodSettingsModule),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, UtilsProvider, ConstantsProvider],
  exports: [SettingsService],
})
export class SettingsModule {}
