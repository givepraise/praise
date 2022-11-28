import { PartialType } from '@nestjs/mapped-types';
import { PeriodSetting } from '../schemas/periodsettings.schema';

export class SetPeriodSettingDto extends PartialType(PeriodSetting) {}
