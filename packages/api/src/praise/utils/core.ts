import { BadRequestError } from '@error/errors';
import { PeriodDateRange, PeriodDocument } from '@period/types';
import { PeriodModel } from '@period/entities';
import { settingValue } from '@shared/settings';
import { PraiseModel } from '../entities';
import { praiseDocumentTransformer } from '../transformers';
import {
  PraiseDetailsDto,
  PraiseDocument,
  PraiseDto,
  Quantification,
} from '../types';

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

export const calculateQuantificationsCompositeScore = async (
  quantifications: Quantification[],
  duplicatePraisePercentage: number
): Promise<number> => {
  if (!quantifications) return 0;

  let si = 0;
  let s = 0;
  for (const quantification of quantifications) {
    if (quantification.score > 0) {
      s += quantification.score;
      si++;
    }
    if (quantification.duplicatePraise) {
      const p = await PraiseModel.findById(quantification.duplicatePraise);
      if (p) {
        for (const pq of p.quantifications) {
          if (
            pq?.quantifier &&
            quantification.quantifier &&
            pq.quantifier.equals(quantification.quantifier) &&
            pq.score > 0
          ) {
            s += Math.floor(pq.score * duplicatePraisePercentage);
            si++;
          }
        }
      }
    }
  }
  if (s > 0) {
    return Math.floor(s / si);
  }
  return 0;
};

export const calculatePraiseScore = async (
  praise: PraiseDocument
): Promise<number> => {
  const period = await getPraisePeriod(praise);
  if (!period) return 0;

  const duplicatePraisePercentage = (await settingValue(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    period._id
  )) as number;
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  return calculateQuantificationsCompositeScore(
    praise.quantifications,
    duplicatePraisePercentage
  );
};

export const praiseWithScore = async (
  praise: PraiseDocument
): Promise<PraiseDto> => {
  const praiseDetailsDto: PraiseDetailsDto = await praiseDocumentTransformer(
    praise
  );
  praiseDetailsDto.score = await calculatePraiseScore(praise);
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
