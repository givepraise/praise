import { QuantifierReceiverData } from '@/model/periods';
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
  for (let i = 0; i < allPeriods.length; i++) {
    if (compareDesc(endDate, new Date(allPeriods[i].endDate)) < 0)
      return allPeriods[i];
  }
  return undefined;
};

// Returns previous period end date or 1970-01-01 if no previous period
export const getPreviousPeriodEndDate = (
  allPeriods: PeriodDto[],
  period: PeriodDto
): Date => {
  const previousPeriod = getPreviousPeriod(allPeriods, period);

  const previousEndDate = previousPeriod
    ? new Date(previousPeriod.endDate)
    : new Date(+0);

  return previousEndDate;
};

export const getQuantifierData = (
  period: PeriodDetailsDto | undefined,
  userId: string | undefined
): PeriodDetailsQuantifierDto | undefined => {
  if (period && period.status === PeriodStatusType.QUANTIFY) {
    return period.quantifiers?.find((q) => q._id === userId);
  }
  return undefined;
};

export const periodQuantifierPraiseListKey = (periodId: string): string =>
  `PERIOD_QUANTIFIER_PRAISE_${periodId}`;

interface QuantificationStats {
  done: number;
  count: number;
}

export const getQuantificationStats = (
  data: QuantifierReceiverData[] | undefined
): QuantificationStats | undefined => {
  const stats: QuantificationStats = {
    done: 0,
    count: 0,
  };

  if (!data || !Array.isArray(data)) return undefined;

  data.forEach((qrd) => {
    stats.done += qrd.done;
    stats.count += qrd.count;
  });

  return stats;
};

export const getQuantificationReceiverStats = (
  data: QuantifierReceiverData[] | undefined,
  receiverId: string | undefined
): QuantifierReceiverData | undefined => {
  if (!receiverId || !data || !Array.isArray(data)) return undefined;

  return data.find((qrd) => qrd.receiverId === receiverId);
};
