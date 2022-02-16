import { PeriodDto } from 'api/dist/period/types';
import { compareDesc } from 'date-fns';

export const getActivePeriod = (allPeriods: PeriodDto[]) => {
  const today = new Date();
  for (const period of allPeriods) {
    if (compareDesc(today, new Date(period.endDate)) >= 0) return period;
  }
  return null;
};

export const getPreviousPeriod = (
  allPeriods: PeriodDto[],
  period: PeriodDto
) => {
  const endDate = new Date(period.endDate);
  for (let i = allPeriods.length - 1; i >= 0; i--) {
    if (compareDesc(endDate, new Date(allPeriods[i].endDate)) < 0)
      return allPeriods[i];
  }
  return null;
};
