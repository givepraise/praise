import { compareDesc } from 'date-fns';
import { QuantifierReceiverData } from '@/model/periods/periods';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';
import { PeriodDetailsQuantifierDto } from '@/model/periods/dto/period-details-quantifier.dto';
import { PeriodStatusType } from '@/model/periods/enums/period-status-type.enum';

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

export const periodQuantifierPraiseListKey = (
  periodId: string,
  quantiferId: string
): string => `PERIOD_QUANTIFIER_PRAISE_${periodId}_${quantiferId}`;

export const periodReceiverPraiseListKey = (
  periodId: string,
  receiverId: string
): string => `PERIOD_RECEIVER_PRAISE_${periodId}_${receiverId}`;

export const periodGiverPraiseListKey = (
  periodId: string,
  giverId: string
): string => `PERIOD_GIVER_PRAISE_${periodId}_${giverId}`;

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

  return data.find((qrd) => qrd.receiver._id === receiverId);
};
