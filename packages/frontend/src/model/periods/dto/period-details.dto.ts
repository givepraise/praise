import { PeriodStatusType } from '../enums/period-status-type.enum';
import { PeriodSettingDto } from '@/model/periodsettings/dto/period-settings.dto';
import { PeriodDetailsQuantifierDto } from './period-details-quantifier.dto';
import { UserAccountDto } from '@/model/useraccount/dto/useraccount.dto';

export interface PeriodDetailsDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  numberOfPraise: number;
  quantifiers?: PeriodDetailsQuantifierDto[];
  givers?: UserAccountDto[];
  receivers?: UserAccountDto[];
  settings?: PeriodSettingDto[];
}
