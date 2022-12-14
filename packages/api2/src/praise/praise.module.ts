import { ConstantsProvider } from '@/constants/constants.provider';
import { Period } from '@/periods/schemas/periods.schema';
import { SettingsService } from '@/settings/settings.service';
import { UtilsProvider } from '@/utils/utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { PeriodSchema } from '../periods/schemas/periods.schema';
import { Setting, SettingSchema } from '@/settings/schemas/settings.schema';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from '@/periodsettings/schemas/periodsettings.schema';
import { PeriodsService } from '@/periods/periods.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from '@/quantifications/schemas/quantifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
  ],
  controllers: [PraiseController],
  providers: [
    PraiseService,
    UtilsProvider,
    ConstantsProvider,
    SettingsService,
    PeriodSettingsService,
    PeriodsService,
    QuantificationsService,
  ],
  exports: [SettingsService],
})
export class PraiseModule {}
