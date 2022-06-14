import add from 'date-fns/add';
import { getPreviousPeriodEndDate } from './utils';
import { PeriodDocument } from 'types/dist/period/types';

/**
 * Validate period endDate is 7+ days after the previous period's endDate
 * @param this
 * @param endDate
 * @returns
 */
async function validatePeriodEndDate7DaysLater(
  this: PeriodDocument,
  endDate: Date
): Promise<Boolean> {
  const previousPeriodEndDate = await getPreviousPeriodEndDate(this);
  const earliestDate = add(previousPeriodEndDate, { days: 7 });

  if (endDate.getTime() > earliestDate.getTime()) return true;

  return false;
}

export const endDateValidators = [
  {
    validator: validatePeriodEndDate7DaysLater,
    msg: 'Must be minimum 7 days later than previous period.',
  },
];
