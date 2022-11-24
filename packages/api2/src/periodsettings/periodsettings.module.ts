import { Module } from '@nestjs/common';
import { PeriodsettingsService } from './periodsettings.service';
import { PeriodsettingsController } from './periodsettings.controller';

@Module({
  controllers: [PeriodsettingsController],
  providers: [PeriodsettingsService]
})
export class PeriodsettingsModule {}
