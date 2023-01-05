import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { PeriodStatusType } from '../enums/status-type.enum';
import { PeriodDetailsGiverReceiver } from '../interfaces/period-details-giver-receiver.interface';
import { PeriodDetailsQuantifier } from '../interfaces/period-details-quantifier.interface';

export interface PeriodDetailsDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  quantifiers?: PeriodDetailsQuantifier[];
  givers?: PeriodDetailsGiverReceiver[];
  receivers?: PeriodDetailsGiverReceiver[];
  settings?: PeriodSetting[];
}
