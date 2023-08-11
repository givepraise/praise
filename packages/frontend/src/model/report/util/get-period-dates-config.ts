import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';
import { getPreviousPeriod } from '@/utils/periods';

export type PeriodDates = {
  startDate: string;
  endDate: string;
};

/**
 * getPeriodDatesConfig function.
 *
 * This function is used to extract the start and end dates of a period. It takes four optional parameters.
 *
 * If `periodId` is provided, the function will try to find the period and the previous period in the `periods` array
 * and return the end date of the previous period as the `startDate` and the end date of the found period as the `endDate`.
 *
 * If `startDate` and `endDate` are provided, the function will simply return them.
 *
 * @param {PeriodDetailsDto[] | undefined} periods - Array of periods.
 * @param {string | undefined} periodId - The id of the period for which to get the dates.
 * @param {string | undefined} startDate - The start date of the period.
 * @param {string | undefined} endDate - The end date of the period.
 *
 * @throws Will throw an error if `periodId` is provided but `periods` is not.
 * @throws Will throw an error if `periodId` is provided but no period with that id can be found in `periods`.
 * @throws Will throw an error if `periodId` is provided but no previous period can be found.
 *
 * @returns {Object | undefined} - An object with `startDate` and `endDate` properties, or `undefined` if none of the parameters are provided.
 */
export function getPeriodDatesConfig(
  periods?: PeriodDetailsDto[],
  periodId?: string,
  startDate?: string,
  endDate?: string
): PeriodDates | undefined {
  if (periodId) {
    if (!periods) {
      throw new Error('Periods could not be loaded');
    }

    const period = periods.find((p) => p._id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    return {
      startDate: period.startDate,
      endDate: period.endDate,
    };
  }

  if (startDate && endDate) {
    return {
      startDate,
      endDate,
    };
  }

  // If neither periodId nor startDate and endDate are provided, return undefined.
  return undefined;
}
