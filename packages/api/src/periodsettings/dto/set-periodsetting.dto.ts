import { PickType } from '@nestjs/swagger';
import { PeriodSetting } from '../schemas/periodsettings.schema';

export class SetPeriodSettingDto extends PickType(PeriodSetting, ['value']) {}
