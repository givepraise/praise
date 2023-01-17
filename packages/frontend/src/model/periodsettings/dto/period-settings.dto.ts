import { PeriodDto } from '@/model/periods/dto/period.dto';
import { SettingDto } from '@/model/settings/dto/setting.dto';

export interface PeriodSettingDto {
  _id: string;
  value: string;
  valueRealized?: string | boolean | number | number[] | string[] | object;
  setting: SettingDto;
  period: PeriodDto;
}
