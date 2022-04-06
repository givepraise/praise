import { add } from 'date-fns';
import { PeriodModel } from './entities';
import { getPreviousPeriodEndDate } from './utils';
import { PeriodDocument } from './types';

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

/**
 * Validate period has the latest endDate of all periods
 * @param this
 * @returns
 */
async function validatePeriodIsLatest(this: PeriodDocument): Promise<boolean> {
  if (this.isNew) return true;

  const latestPeriod = await PeriodModel.findOne(
    {},
    {
      limit: 1,
      sort: { endDate: -1 },
    }
  );

  if (!latestPeriod) return true;
  if (latestPeriod._id.toString() === this._id.toString()) return true;

  return false;
}

/**
 * Validate period status is OPEN
 * @param this
 * @returns
 */
function validatePeriodIsOpen(this: PeriodDocument): boolean {
  if (this.status === 'OPEN') return true;

  return false;
}

export const endDateValidators = [
  {
    validator: validatePeriodEndDate7DaysLater,
    msg: 'Must be minimum 7 days later than previous period.',
  },
  {
    validator: validatePeriodIsLatest,
    msg: 'Date change only allowed on last period.',
  },
  {
    validator: validatePeriodIsOpen,
    msg: 'Date change only allowed on open periods.',
  },
];
