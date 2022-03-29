import { BadRequestError, NotFoundError } from '@error/errors';
import { PraiseModel } from '@praise/entities';
import { calculateQuantificationsCompositeScore } from '@praise/utils';
import { SettingsModel } from '@settings/entities';
import { SettingDocument } from '@settings/types';
import { settingValue } from '@shared/settings';
import { sum } from 'lodash';
import mongoose from 'mongoose';
import { PeriodModel } from './entities';
import {
  periodDetailsReceiverListTransformer,
  periodDocumentTransformer,
} from './transformers';
import {
  Period,
  PeriodDocument,
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDetailsReceiver,
  PeriodDateRange,
  PeriodStatusType,
} from './types';

// Returns previous period end date or 1970-01-01 if no previous period
export const getPreviousPeriodEndDate = async (
  period: Period
): Promise<Date> => {
  const previousPeriod = await PeriodModel.findOne({
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });

  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  return previousEndDate;
};

const calculateReceiverScores = async (
  receivers: PeriodDetailsReceiver[],
  periodId: mongoose.Schema.Types.ObjectId
): Promise<PeriodDetailsReceiver[]> => {
  const duplicatePraisePercentage = (await settingValue(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    periodId
  )) as number;

  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  const receiversWithQuantificationScores = await Promise.all(
    receivers.map(async (r) => {
      if (!r.quantifications) return r;

      const quantifierScores = await Promise.all(
        r.quantifications.map((q) =>
          calculateQuantificationsCompositeScore(q, duplicatePraisePercentage)
        )
      );

      return {
        ...r,
        score: sum(quantifierScores),
        quantifications: undefined,
      };
    })
  );

  return receiversWithQuantificationScores;
};

export const findPeriodDetailsDto = async (
  id: string
): Promise<PeriodDetailsDto> => {
  const period = await PeriodModel.findById(id);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const [quantifiers, receivers]: [
    PeriodDetailsQuantifierDto[],
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
        $addFields: {
          finished: {
            $or: [
              { $ne: ['$quantifications.dismissed', false] },
              { $gt: ['$quantifications.score', 0] },
              { $gt: ['$quantifications.duplicatePraise', null] },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$quantifications.quantifier',
          praiseCount: { $count: {} },
          finishedCount: { $sum: { $toInt: '$finished' } },
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
    ]),
  ]);

  const receiversWithScores = await calculateReceiverScores(
    receivers,
    period._id
  );

  const response = {
    ...periodDocumentTransformer(period),
    receivers: await periodDetailsReceiverListTransformer(receiversWithScores),
    quantifiers: [...quantifiers],
  };
  return response;
};

/**
 * Find all Periods where status = QUANTIFY
 * @param match Any paramaters to add to mongoose find query
 * @returns
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
 * Get mongoose query object representing date range of Period
 * @param period
 * @returns
 */
export const getPeriodDateRangeQuery = async (
  period: Period
): Promise<PeriodDateRange> => ({
  $gt: await getPreviousPeriodEndDate(period),
  $lte: period.endDate,
});

export const insertNewPeriodSettings = async (
  period: PeriodDocument
): Promise<void> => {
  let defaultSettings = await SettingsModel.find({
    periodOverridable: true,
    period: { $exists: 0 },
  });
  if (defaultSettings && !Array.isArray(defaultSettings))
    defaultSettings = [defaultSettings];

  const newPeriodSettings = (defaultSettings as SettingDocument[]).map(
    (setting) => {
      const defaultSetting = setting.toObject();
      delete defaultSetting._id;

      return {
        ...defaultSetting,
        period: period._id,
        periodOverridable: false,
      };
    }
  );

  await SettingsModel.insertMany(newPeriodSettings);
};
