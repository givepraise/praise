import { PartialType } from '@nestjs/mapped-types';
import { PeriodSettings } from '../schemas/periodsettings.schema';

export class SetPeriodSettingDto extends PartialType(PeriodSettings) {}
