import { PeriodStatusType } from '../enums/period-status-type.enum';

export interface PeriodDto {
  name: string;
  status: PeriodStatusType;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
