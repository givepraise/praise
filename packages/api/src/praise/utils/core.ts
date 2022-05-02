import { PeriodDateRange, PeriodDocument } from '@period/types';
import { PeriodModel } from '@period/entities';
import { PraiseModel } from '../entities';
import { praiseDocumentTransformer } from '../transformers';
import { PraiseDocument, PraiseDetailsDto, Quantification } from '../types';

/**
 * Workaround to get the period associated with a praise instance (as they are not related in database)
 *
 * Determines the associated period by:
 *  finding the period with the lowest endDate, that is greater than the praise.createdAt date
 *
 *  @param praise the praise instance
 */
export const getPraisePeriod = async (
  praise: PraiseDocument
): Promise<PeriodDocument | undefined> => {
  const period = await PeriodModel.find(
    // only periods ending after praise created
    {
      endDate: { $gte: praise.createdAt },
    },

    // sort periods by ending date ascending
    {
      sort: { endDate: 1 },
    }

    // select the period with the earliest ending date
  ).limit(1);

  if (!period || period.length === 0) return undefined;

  return period[0];
};

export const praiseWithScore = async (
  praise: PraiseDocument
): Promise<PraiseDetailsDto> => {
  const praiseDetailsDto = await praiseDocumentTransformer(praise);

  return praiseDetailsDto;
};

/**
 * Count all praise within given date ranges
 * @param dateRanges
 * @param match
 * @returns
 */
export const countPraiseWithinDateRanges = async (
  dateRanges: PeriodDateRange[],
  match: object = {}
): Promise<number> => {
  const withinDateRangeQueries: { $createdAt: PeriodDateRange }[] =
    dateRanges.map((q) => ({
      $createdAt: q,
    }));

  const assignedPraiseCount: number = await PraiseModel.count({
    $or: withinDateRangeQueries,
    ...match,
  });

  return assignedPraiseCount;
};

export const isQuantificationCompleted = (
  quantification: Quantification
): boolean => {
  return (
    quantification.dismissed ||
    quantification.duplicatePraise !== undefined ||
    quantification.score > 0
  );
};
