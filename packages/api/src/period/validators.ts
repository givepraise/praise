/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PeriodModel } from './entities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateEndDate(this: any, endDate: Date): Promise<Boolean> {
  // This rule don't apply when no change to endDate has been made
  if (!this.$__.activePaths.states.modify.endDate) return true;

  // Find two last periods
  const twoLastPeriods = await PeriodModel.find(
    {},
    {},
    { limit: 2, sort: { endDate: -1 } }
  );

  // No period exists = this is the first period = allow any date
  if (!twoLastPeriods || twoLastPeriods.length === 0) return true;

  let d1;
  // Save new period = compare to last period
  // Update period = compare to 2nd last period
  if (this.isNew) {
    d1 = twoLastPeriods[0].endDate;
  } else {
    d1 = twoLastPeriods[1].endDate;
  }
  d1.setDate(d1.getDate() + 7);

  if (endDate < d1) return false; // Must be minimum 7 days later than previous period

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateOnlyUpdateLastPeriod(this: any): Promise<boolean> {
  // This rule don't apply to new documents
  if (this.isNew) return true;

  // This rule don't apply when no change to endDate has been made
  if (!this.$__.activePaths.states.modify.endDate) return true;

  // Find two last periods
  const twoLastPeriods = await PeriodModel.find(
    {},
    {},
    { limit: 2, sort: { endDate: -1 } }
  );

  // No period exists = this is the first period = allow any date
  // Only one item in array, this is the last and first period = allow any date
  if (!twoLastPeriods || twoLastPeriods.length === 1) return true;

  // Date change only allowed on last period
  if (!twoLastPeriods[0]._id || !twoLastPeriods[0]._id.equals(this._id))
    return false;

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateOnlyUpdateOpenPeriod(this: any): boolean {
  // This rule don't apply to new documents
  if (this.isNew) return true;

  // This rule don't apply when no change to endDate has been made
  if (!this.$__.activePaths.states.modify.endDate) return true;

  if (this.status !== 'OPEN') return false;

  return true;
}

export const endDateValidators = [
  {
    validator: validateEndDate,
    msg: 'Must be minimum 7 days later than previous period.',
  },
  {
    validator: validateOnlyUpdateLastPeriod,
    msg: 'Date change only allowed on last period.',
  },
  {
    validator: validateOnlyUpdateOpenPeriod,
    msg: 'Date change only allowed on open periods.',
  },
];
