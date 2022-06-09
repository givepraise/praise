import { QuantifierReceiverData } from '@/model/periods';
import {
  PeriodDetailsQuantifierDto,
  PeriodDetailsDto,
  PeriodStatusType,
} from 'shared/dist/period/types';
import { compareDesc } from 'date-fns';

export const getActivePeriod = (
  allPeriods: PeriodDetailsDto[]
): PeriodDetailsDto | undefined => {
  const today = new Date();
  for (const period of allPeriods) {
    if (compareDesc(today, new Date(period.endDate)) >= 0) return period;
  }
  return undefined;
};

export const getPreviousPeriod = (
  allPeriods: PeriodDetailsDto[],
  period: PeriodDetailsDto
): PeriodDetailsDto | undefined => {
  const endDate = new Date(period.endDate);
  for (let i = 0; i < allPeriods.length; i++) {
    if (compareDesc(endDate, new Date(allPeriods[i].endDate)) < 0)
      return allPeriods[i];
  }
  return undefined;
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
