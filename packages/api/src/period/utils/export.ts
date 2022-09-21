import axios, { AxiosResponse } from 'axios';
import { transform } from './jsonTransformer';
import {
  PeriodDetailsGiverReceiverDto,
  TransformerOperateItem,
  TransformerMap,
} from '../types';

export const getCustomExportTransformer = async (
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
  }
  throw new Error('Unknown error');
};

interface LocalExportContext {
  totalPraiseScore: number;
  praiseItemsCount: number;
}

export const runCustomExportTransformer = (
  data: PeriodDetailsGiverReceiverDto[],
  customExportContext: string,
  localExportContext: LocalExportContext,
  transformer: TransformerMap
): Object[] => {
  const exportContext = JSON.parse(
    customExportContext
  ) as typeof transformer.context;

  const context = {
    ...exportContext,
    ...localExportContext,
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
