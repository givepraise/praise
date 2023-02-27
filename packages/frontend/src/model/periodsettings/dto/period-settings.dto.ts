import { PeriodDto } from '@/model/periods/dto/period.dto';
import { SettingDto } from '@/model/settings/dto/setting.dto';

export interface PeriodSettingDto {
  _id: string;
  value: string;
  valueRealized?: string | string[] | boolean | number | number[] | undefined;
  setting: SettingDto;
  period: PeriodDto;
}
