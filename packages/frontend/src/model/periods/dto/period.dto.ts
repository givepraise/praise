import { PeriodStatusType } from '../enums/period-status-type.enum';

export interface Period {
  name: string;
  status: PeriodStatusType;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
