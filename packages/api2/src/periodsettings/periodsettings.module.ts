import { Module } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodsettingsController } from './periodsettings.controller';

@Module({
  controllers: [PeriodsettingsController],
  providers: [PeriodSettingsService],
})
export class PeriodsettingsModule {}
