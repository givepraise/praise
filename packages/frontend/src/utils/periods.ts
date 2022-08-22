import {
  PeriodDetailsQuantifierDto,
  PeriodDetailsDto,
  PeriodStatusType,
  PeriodReceiverDto,
} from 'api/dist/period/types';
import { compareDesc } from 'date-fns';
// import { transform } from 'node-json-transform';
import { SettingDto } from 'api/dist/settings/types';
import safeEval from 'safe-eval';
import { QuantifierReceiverData, SummarizedPeriodData } from '@/model/periods';
import transformer from '@/utils/transformer.json';
import { transform } from './jsonTransformer';

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

interface MapTransformer {
  name: string;
  map: {
    item: any;
    operate: any;
    each: any;
  };
  context: object;
}

export const getSummarizedReceiverData = (
  data: PeriodReceiverDto[],
  customExportContext: SettingDto | undefined,
  csSupportPercentage: SettingDto | undefined,
  mapTransformer: string
): SummarizedPeriodData[] => {
  if (!customExportContext || !csSupportPercentage) return [];

  // const transformer = JSON.parse(mapTransformer) as MapTransformer;

  const exportContext = JSON.parse(
    customExportContext.value
  ) as typeof transformer.context;

  const totalPraiseScore = data
    .map((item) => item.scoreRealized)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    .reduce((prev, next) => prev + next);

  const context = {
    ...exportContext,
    ...{
      totalPraiseScore: totalPraiseScore,
      csWalletAddress: 'Test ETH address',
      csSupportPercentage: csSupportPercentage.valueRealized,
    },
  };

  const map = {
    item: transformer.map.item,
    operate: transformer.map.operate.map((operateItem) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        run: new Function(operateItem.run.arguments, operateItem.run.body),
        on: operateItem.on,
      };
    }),
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    each: new Function(
      transformer.map.each.arguments,
      transformer.map.each.body
    ),
  };

  const result = transform(data, map, context);
  return result;
};
