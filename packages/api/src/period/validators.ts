import { add } from 'date-fns';
import { PeriodDocument } from './types';
import { getPreviousPeriodEndDate } from './utils/core';

/**
 * Check if period endDate is 7+ days after the previous period's endDate
 *
 * @param {PeriodDocument} this
 * @param {Date} endDate
 * @returns {Promise<Boolean>}
 */
async function isPeriodEndDate7DaysLater(
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
    validator: isPeriodEndDate7DaysLater,
    msg: 'Must be minimum 7 days later than previous period.',
  },
];
