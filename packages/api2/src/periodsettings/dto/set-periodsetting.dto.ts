import { PartialType } from '@nestjs/swagger';
import { PeriodSetting } from '../schemas/periodsettings.schema';

export class SetPeriodSettingDto extends PartialType(PeriodSetting) {}
