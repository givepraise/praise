import { Module, forwardRef } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSettingsController } from './periodsettings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';
import { PeriodsModule } from '@/periods/periods.module';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EventLogModule } from '@/event-log/event-log.module';
import { SettingsModule } from '@/settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
    EventLogModule,
    forwardRef(() => PeriodsModule),
    forwardRef(() => SettingsModule),
  ],
  controllers: [PeriodSettingsController],
  providers: [PeriodSettingsService, ConstantsProvider],
  exports: [PeriodSettingsService],
})
export class PeriodSettingsModule {}
