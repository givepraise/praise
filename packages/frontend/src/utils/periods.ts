import { compareDesc } from 'date-fns';
import { QuantifierReceiverData } from '@/model/periods/periods';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';
import { PeriodDetailsQuantifierDto } from '@/model/periods/dto/period-details-quantifier.dto';
import { PeriodStatusType } from '@/model/periods/enums/period-status-type.enum';

// Interface to hold quantification statistics.
interface QuantificationStats {
  done: number;
  count: number;
}

/**
 * Function to get the previous period based on endDate.
 * Iterates through all periods, and returns the first period
 * that ended before the provided period.
 */
export function getPreviousPeriod(
  allPeriods: PeriodDetailsDto[],
  period: PeriodDetailsDto
): PeriodDetailsDto | undefined {
  const endDate = new Date(period.endDate);
  return [...allPeriods]
    .sort((a, b) => {
      return compareDesc(new Date(a.endDate), new Date(b.endDate));
    })
    .find(
      (existingPeriod) =>
        compareDesc(endDate, new Date(existingPeriod.endDate)) < 0
    );
}

/**
 * Function to check if a period has ended.
 * Compares the endDate of the period with the current date.
 */
export function hasPeriodEnded(period: PeriodDetailsDto): boolean {
  return new Date(period.endDate).getTime() < Date.now();
}

/**
 * Function to get quantifier data from a period.
 * Finds a quantifier in the period with a matching id.
 */
export function getQuantifierData(
  period: PeriodDetailsDto | undefined,
  userId: string | undefined
): PeriodDetailsQuantifierDto | undefined {
  if (!period || !userId || period.status !== PeriodStatusType.QUANTIFY) {
    return undefined;
  }
  return period.quantifiers?.find((quantifier) => quantifier._id === userId);
}

// Utility functions to create cache keys for different types of period praise lists.
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

/**
 * Function to calculate quantification stats from provided data.
 * Iterates over the data, adding up the done and count values.
 */
export function getQuantificationStats(
  data: QuantifierReceiverData[] | undefined
): QuantificationStats | undefined {
  if (!data || !Array.isArray(data)) {
    return undefined;
  }

  return data.reduce(
    (stats, qrd) => {
      stats.done += qrd.done;
      stats.count += qrd.count;
      return stats;
    },
    { done: 0, count: 0 } as QuantificationStats
  );
}

/**
 * Function to get quantification receiver stats.
 * Finds the first quantification receiver data with a matching receiver id.
 */
export function getQuantificationReceiverStats(
  data: QuantifierReceiverData[] | undefined,
  receiverId: string | undefined
): QuantifierReceiverData | undefined {
  if (!receiverId || !data || !Array.isArray(data)) {
    return undefined;
  }

  return data.find((qrd) => qrd.receiver._id === receiverId);
}
