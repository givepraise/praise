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

export const runCustomExportTransformer = (
  data: PeriodDetailsGiverReceiverDto[],
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  context: any,
  transformer: TransformerMap
): Object[] => {
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
