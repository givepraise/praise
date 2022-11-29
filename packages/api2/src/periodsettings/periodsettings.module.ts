import { Module } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodsettingsController } from './periodsettings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
  ],
  controllers: [PeriodsettingsController],
  providers: [PeriodSettingsService],
})
export class PeriodSettingsModule {}
