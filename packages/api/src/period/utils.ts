import { PraiseModel } from '@praise/entities';
import { calculatePraiseScore } from '@praise/utils';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { settingFloat } from '@shared/settings';
import { PeriodModel } from './entities';
import {
  periodDetailsReceiverListTransformer,
  periodDocumentTransformer,
} from './transformers';
import {
  Period,
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDetailsReceiver,
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
  receivers: PeriodDetailsReceiver[]
): Promise<PeriodDetailsReceiver[]> => {
  const duplicatePraisePercentage = await settingFloat(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  );
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  for (const r of receivers) {
    let score = 0;
    if (!r.quantifications) continue;
    for (const quantification of r.quantifications) {
      score += await calculatePraiseScore(quantification);
    }
    r.score = score;
    delete r.quantifications;
  }
  return receivers;
};

export const findPeriodDetailsDto = async (
  id: string
): Promise<PeriodDetailsDto> => {
  const period = await PeriodModel.findById(id);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const quantifier: PeriodDetailsQuantifierDto[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      },
    },
    { $unwind: '$quantifications' },
    {
      $addFields: {
        finished: {
          $or: [
            { $ne: ['$quantifications.dismissed', false] },
            { $gt: ['$quantifications.score', 0] },
            { $ne: ['$quantifications.duplicatePraise', null] },
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
  ]);

  const receivers: PeriodDetailsReceiver[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
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
  ]);

  await calculateReceiverScores(receivers);

  const response = {
    ...periodDocumentTransformer(period),
    receivers: await periodDetailsReceiverListTransformer(receivers),
    quantifiers: [...quantifier],
  };
  return response;
};
