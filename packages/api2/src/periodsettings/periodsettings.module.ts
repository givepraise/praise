import { Module } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodsettingsController } from './periodsettings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';
import { PeriodsModule } from '@/periods/periods.module';
import { UtilsProvider } from '@/utils/utils.provider';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
    PeriodsModule,
  ],
  controllers: [PeriodsettingsController],
  providers: [PeriodSettingsService, UtilsProvider, ConstantsProvider],
  exports: [
    PeriodSettingsService,
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
  ],
})
export class PeriodSettingsModule {}
