import { PeriodDto } from '@/model/periods/dto/period.dto';
import { SettingDto } from '@/model/settings/dto/setting.dto';

export interface PeriodSettingDto {
  _id: string;
  value: string;
  setting: SettingDto;
  period: PeriodDto;
}
