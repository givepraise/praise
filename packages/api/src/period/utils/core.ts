import some from 'lodash/some';
import { NotFoundError } from '@/error/errors';
import { PraiseModel } from '@/praise/entities';
import { calculateReceiverCompositeScore } from '@/praise/utils/score';
import { periodsettingListTransformer } from '@/periodsettings/transformers';
import { PeriodSettingsModel } from '@/periodsettings/entities';
import { settingValue } from '@/shared/settings';
import { isQuantificationCompleted } from '@/praise/utils/core';
import { PeriodModel } from '../entities';
import {
  periodDetailsReceiverListTransformer,
  periodReceiverListTransformer,
  periodTransformer,
} from '../transformers';
import {
  PeriodDocument,
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDetailsQuantifier,
  PeriodDetailsReceiver,
  PeriodDateRange,
  PeriodStatusType,
  PeriodReceiver,
  PeriodReceiverDto,
} from '../types';

/**
 * Fetch the previous period's endDate,
 *  or 1970-01-01 if no previous period exists
 *
 * @param {PeriodDocument} period
 * @returns {Promise<Date>}
 */
export const getPreviousPeriodEndDate = async (
  period: PeriodDocument
): Promise<Date> => {
  const previousPeriod = await PeriodModel.findOne({
    _id: { $ne: period._id },
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });

  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  return previousEndDate;
};

/**
 * Fetch a list of receivers detailed
 *
 * @param {PeriodDetailsReceiver[]} receivers
 * @returns {Promise<PeriodDetailsReceiver[]>}
 */
export const receiversWithScores = async (
  receivers: PeriodDetailsReceiver[]
): Promise<PeriodDetailsReceiver[]> => {
  const receiversWithQuantificationScores = await Promise.all(
    receivers.map(async (r) => {
      const scoreRealized = await calculateReceiverCompositeScore(r);

      return {
        ...r,
        scoreRealized,
        quantifications: undefined,
      };
    })
  );

  return receiversWithQuantificationScores;
};

/**
 * Attach finishedCounts to a list of Praise.quantifiers with details in a period
 *
 * @param {PeriodDetailsQuantifier[]} quantifiers
 * @returns {PeriodDetailsQuantifierDto[]}
 */
const quantifiersWithCounts = (
  quantifiers: PeriodDetailsQuantifier[]
): PeriodDetailsQuantifierDto[] => {
  const quantifiersWithQuantificationCounts = quantifiers.map((q) => {
    const finishedCount = q.quantifications.filter((quantification) =>
      isQuantificationCompleted(quantification)
    ).length;

    return {
      _id: q._id,
      praiseCount: q.praiseCount,
      finishedCount,
    };
  });

  return quantifiersWithQuantificationCounts;
};

/**
 * Fetch a period with details about it's receivers and quantifiers
 *
 * @param {string} id
 * @returns {Promise<PeriodDetailsDto>}
 */
export const findPeriodDetailsDto = async (
  id: string
): Promise<PeriodDetailsDto> => {
  const period = await PeriodModel.findById(id);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const [quantifiers, receivers]: [
    PeriodDetailsQuantifier[],
    PeriodDetailsReceiver[]
  ] = await Promise.all([
    PraiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      { $unwind: '$quantifications' },
      {
        $group: {
          _id: '$quantifications.quantifier',
          praiseCount: { $count: {} },
          quantifications: {
            $push: '$quantifications',
          },
        },
      },
    ]),
    PraiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'receiver',
          foreignField: '_id',
          as: 'userAccounts',
        },
      },
      {
        $group: {
          _id: '$receiver',
          praiseCount: { $count: {} },
          quantifications: {
            $push: '$quantifications',
          },
          userAccounts: { $first: '$userAccounts' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  const quantifiersWithCountsData = quantifiersWithCounts(quantifiers);
  const receiversWithScoresData = await receiversWithScores(receivers);

  const periodsettings = await PeriodSettingsModel.find({ period: period._id });

  const response = {
    ...periodTransformer(period),
    receivers: await periodDetailsReceiverListTransformer(
      receiversWithScoresData
    ),
    quantifiers: [...quantifiersWithCountsData],
    settings: periodsettingListTransformer(periodsettings),
  };
  return response;
};

export const findPeriodReceivers = async (
  id: string
): Promise<PeriodReceiverDto[]> => {
  const period = await PeriodModel.findById(id);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const receivers = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: {
          $gt: previousPeriodEndDate,
          $lte: period.endDate,
        },
      },
    },
    {
      $lookup: {
        from: 'useraccounts',
        localField: 'receiver',
        foreignField: '_id',
        as: 'userAccounts',
      },
    },
    {
      $group: {
        _id: '$receiver',
        praiseCount: { $count: {} },
        quantifications: {
          $push: '$quantifications',
        },
        userAccounts: { $first: '$userAccounts' },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const receiversWithScore = await receiversWithScores(receivers);
  return await periodReceiverListTransformer(receiversWithScore);
};

/**
 * Find all Periods where status = QUANTIFY
 *
 * @param {object} [match={}]
 * @returns {Promise<PeriodDocument[]>}
 */
export const findActivePeriods = async (
  match: object = {}
): Promise<PeriodDocument[]> => {
  let periods: PeriodDocument[] | PeriodDocument = await PeriodModel.find({
    status: PeriodStatusType.QUANTIFY,
    ...match,
  });
  if (!Array.isArray(periods)) periods = [periods];

  return periods;
};

/**
 * Generate object for use in mongoose queries,
 *  to filter by date range of a Period
 *
 * @param {PeriodDocument} period
 * @returns {Promise<PeriodDateRange>}
 */
export const getPeriodDateRangeQuery = async (
  period: PeriodDocument
): Promise<PeriodDateRange> => ({
  $gt: await getPreviousPeriodEndDate(period),
  $lte: period.endDate,
});

/**
 * Check if any praise in the given period has already been assigned to quantifiers
 *
 * @param {PeriodDocument} period
 * @returns {Promise<boolean>}
 */
export const isAnyPraiseAssigned = async (
  period: PeriodDocument
): Promise<boolean> => {
  const periodDateRangeQuery = await getPeriodDateRangeQuery(period);

  const praises = await PraiseModel.find({
    createdAt: periodDateRangeQuery,
  });

  const quantifiersPerPraiseReceiver = (await settingValue(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  )) as number;

  const praisesAssigned = praises.map(
    (praise) => praise.quantifications.length === quantifiersPerPraiseReceiver
  );

  return some(praisesAssigned);
};

/**
 * Check if period has the latest endDate of all periods?
 *
 * @param {PeriodDocument} period
 * @returns {Promise<boolean>}
 */
export const isPeriodLatest = async (
  period: PeriodDocument
): Promise<boolean> => {
  const latestPeriods = await PeriodModel.find({})
    .sort({ endDate: -1 })
    .orFail();

  if (latestPeriods.length === 0) return true;
  if (latestPeriods[0]._id.toString() === period._id.toString()) return true;

  return false;
};
