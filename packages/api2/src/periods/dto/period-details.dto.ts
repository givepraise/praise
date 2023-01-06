import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { PeriodDetailsGiverReceiver } from '../interfaces/period-details-giver-receiver.interface';
import { Types } from 'mongoose';
import { PeriodDetailsQuantifierDto } from './period-details-quantifier.dto';

export interface PeriodDetailsDto {
  _id: Types.ObjectId;
  name: string;
  status: string;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  quantifiers?: PeriodDetailsQuantifierDto[];
  givers?: PeriodDetailsGiverReceiver[];
  receivers?: PeriodDetailsGiverReceiver[];
  settings?: PeriodSetting[];
}
