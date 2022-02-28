import { BadRequestError, NotFoundError } from '@error/errors';
import { PraiseModel } from '@praise/entities';
import { calculateQuantificationsCompositeScore } from '@praise/utils';
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
import { sum } from 'lodash';

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

  const receiversWithQuantificationScores = await Promise.all(
    receivers.map(async (r) => {
      if (!r.quantifications) return r;

      const quantifierScores = await Promise.all(
        //@ts-ignore
        r.quantifications.map((q) => calculateQuantificationsCompositeScore(q, duplicatePraisePercentage))
      );

      return {
        ...r,
        score: sum(quantifierScores),
        quantifications: undefined
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

  const [quantifiers, receivers]: [PeriodDetailsQuantifierDto[], PeriodDetailsReceiver[]] = await Promise.all([
    PraiseModel.aggregate([
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
    ]),
  ]);

  const receiversWithScores = await calculateReceiverScores(receivers);

  const response = {
    ...periodDocumentTransformer(period),
    receivers: await periodDetailsReceiverListTransformer(receiversWithScores),
    quantifiers: [...quantifiers],
  };
  return response;
};
