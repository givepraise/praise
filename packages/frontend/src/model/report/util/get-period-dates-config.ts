import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';
import { getPreviousPeriod } from '@/utils/periods';

/**
 * Get period dates from periodId or startDate and endDate
 */
export function getPeriodDatesConfig(
  periods?: PeriodDetailsDto[],
  periodId?: string,
  startDate?: string,
  endDate?: string
): { startDate: string; endDate: string } | undefined {
  if (periodId) {
    if (!periods) {
      throw new Error('Periods could not be loaded');
    }
    const period = periods.find((p) => p._id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }
    const previousPeriod = getPreviousPeriod(periods, period);
    if (!previousPeriod) {
      throw new Error('Previous period not found');
    }
    return {
      startDate: previousPeriod.endDate,
      endDate: period.endDate,
    };
  }
  if (startDate && endDate) {
    return {
      startDate,
      endDate,
    };
  }
  return undefined;
}
