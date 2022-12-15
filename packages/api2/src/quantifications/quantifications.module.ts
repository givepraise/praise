import { ConstantsProvider } from '@/constants/constants.provider';
import { PeriodsService } from '@/periods/periods.service';
import { Period, PeriodSchema } from '@/periods/schemas/periods.schema';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from '@/periodsettings/schemas/periodsettings.schema';
import { PraiseService } from '@/praise/praise.service';
import { Praise, PraiseSchema } from '@/praise/schemas/praise.schema';
import { Setting, SettingSchema } from '@/settings/schemas/settings.schema';
import { SettingsService } from '@/settings/settings.service';
import { UtilsProvider } from '@/utils/utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
  ],
  providers: [
    QuantificationsService,
    PraiseService,
    SettingsService,
    UtilsProvider,
    PeriodSettingsService,
    ConstantsProvider,
    PeriodsService,
  ],
})
export class QuantificationsModule {}
