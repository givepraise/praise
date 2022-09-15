import axios, { AxiosResponse } from 'axios';
import { transform } from './jsonTransformer';
import {
  PeriodDetailsGiverReceiverDto,
  TransformerOperateItem,
  TransformerMap,
} from '../types';

export const getExportTransformer = async (
  url: string
): Promise<TransformerMap> => {
  let response: AxiosResponse | undefined = undefined;
  try {
    response = await axios.get(url);
  } catch (error) {
    throw new Error('Could not fetch transformer');
  }

  // TODO add schema validation
  if (response) {
    return response.data as TransformerMap;
    // const buff = Buffer.from(response.data, 'base64');
    // return JSON.parse(buff.toString('utf-8')) as TransformerMap;
  }
  throw new Error('Unknown error');
};

export const getSummarizedReceiverData = (
  data: PeriodDetailsGiverReceiverDto[],
  customExportContext: string,
  csSupportPercentage: number,
  transformer: TransformerMap
): Object[] => {
  const exportContext = JSON.parse(
    customExportContext
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
      csSupportPercentage: csSupportPercentage,
    },
  };

  const map = {
    item: transformer.map.item,
    operate: transformer.map.operate.map(
      (operateItem: TransformerOperateItem) => {
        return {
          run: operateItem.run,
          on: operateItem.on,
        };
      }
    ),
    each: transformer.map.each,
  };

  const result = transform(data, map, context);
  return result;
};
