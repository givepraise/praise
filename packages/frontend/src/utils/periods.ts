import {
  PeriodDetailsQuantifierDto,
  PeriodDetailsDto,
  PeriodStatusType,
  PeriodReceiverDto,
} from 'api/dist/period/types';
import { compareDesc } from 'date-fns';
import { transform } from 'node-json-transform';
import { QuantifierReceiverData, SummarizedPeriodData } from '@/model/periods';
import transformer from '@/utils/transformer.json';

export const getPreviousPeriod = (
  allPeriods: PeriodDetailsDto[],
  period: PeriodDetailsDto
): PeriodDetailsDto | undefined => {
  const endDate = new Date(period.endDate);
  for (let i = 0; i < allPeriods.length; i++) {
    if (compareDesc(endDate, new Date(allPeriods[i].endDate)) < 0)
      return allPeriods[i];
  }
  return undefined;
};

export const getQuantifierData = (
  period: PeriodDetailsDto | undefined,
  userId: string | undefined
): PeriodDetailsQuantifierDto | undefined => {
  if (period && period.status === PeriodStatusType.QUANTIFY) {
    return period.quantifiers?.find((q) => q._id === userId);
  }
  return undefined;
};

export const periodQuantifierPraiseListKey = (periodId: string): string =>
  `PERIOD_QUANTIFIER_PRAISE_${periodId}`;

export const periodReceiverPraiseListKey = (
  periodId: string,
  receiverId: string
): string => `PERIOD_RECEIVER_PRAISE_${periodId}_${receiverId}`;

interface QuantificationStats {
  done: number;
  count: number;
}

export const getQuantificationStats = (
  data: QuantifierReceiverData[] | undefined
): QuantificationStats | undefined => {
  const stats: QuantificationStats = {
    done: 0,
    count: 0,
  };

  if (!data || !Array.isArray(data)) return undefined;

  data.forEach((qrd) => {
    stats.done += qrd.done;
    stats.count += qrd.count;
  });

  return stats;
};

export const getQuantificationReceiverStats = (
  data: QuantifierReceiverData[] | undefined,
  receiverId: string | undefined
): QuantifierReceiverData | undefined => {
  if (!receiverId || !data || !Array.isArray(data)) return undefined;

  return data.find((qrd) => qrd.receiver._id === receiverId);
};

export const getSummarizedReceiverData = (
  data: PeriodReceiverDto[]
): SummarizedPeriodData[] => {
  const totalPraiseScore = data
    .map((item) => item.scoreRealized)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    .reduce((prev, next) => prev + next);

  const context = {
    totalPraiseScore: totalPraiseScore,
    csWalletAddress: process.env.REACT_APP_CS_WALLET_ADDRESS,
    csSupportPercentage: process.env.REACT_APP_CS_SUPPORT_PERCENTAGE,
    budget: process.env.REACT_APP_BUDGET,
    token: process.env.REACT_APP_TOKEN,
  };

  const map = {
    item: transformer.map.item,
    operate: [
      {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        run: new Function(
          transformer.map.operate.run.arguments,
          transformer.map.operate.run.body
        ),
        on: transformer.map.operate.on,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    each: new Function(
      transformer.map.each.arguments,
      transformer.map.each.body
    ),
  };

  // const map = {
  //   item: {
  //     address: 'ethereumAddress',
  //     amount: 'scoreRealized',
  //     token: 'context.token',
  //   },
  //   operate: [
  //     {
  //       run: function (val, context) {
  //         return (val / context.totalPraiseScore) * context.budget;
  //       },
  //       on: 'amount',
  //     },
  //   ],
  //   each: function (item, index, collection, context) {
  //     item.token = context.token;
  //     return item;
  //   },
  // };

  const result = transform(data, map, context);
  return result;
};
