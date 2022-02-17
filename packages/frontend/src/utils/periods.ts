import {
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDto,
  PeriodStatusType,
} from 'api/dist/period/types';
import { compareDesc } from 'date-fns';

export const getActivePeriod = (
  allPeriods: PeriodDto[]
): PeriodDto | undefined => {
  const today = new Date();
  for (const period of allPeriods) {
    if (compareDesc(today, new Date(period.endDate)) >= 0) return period;
  }
  return undefined;
};

export const getPreviousPeriod = (
  allPeriods: PeriodDto[],
  period: PeriodDto
): PeriodDto | undefined => {
  const endDate = new Date(period.endDate);
  for (let i = allPeriods.length - 1; i >= 0; i--) {
    if (compareDesc(endDate, new Date(allPeriods[i].endDate)) < 0)
      return allPeriods[i];
  }
  return undefined;
};

export const getQuantifierData = (
  period: PeriodDetailsDto | undefined,
  userId: string | null
): PeriodDetailsQuantifierDto | undefined => {
  if (period && period.status === PeriodStatusType.QUANTIFY) {
    return period.quantifiers?.find((q) => q._id === userId);
  }
  return undefined;
};
