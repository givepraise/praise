import axios, { AxiosResponse } from 'axios';
import { transform } from './jsonTransformer';
import {
  PeriodDetailsGiverReceiverDto,
  ExportTransformerOperateItem,
  ExportTransformerMap,
} from '../types';

export const getCustomExportTransformer = async (
  url: string
): Promise<ExportTransformerMap> => {
  let response: AxiosResponse | undefined = undefined;
  try {
    response = await axios.get(url);
  } catch (error) {
    throw new Error('Could not fetch transformer');
  }

  // TODO add schema validation
  if (response) {
    return response.data as ExportTransformerMap;
  }
  throw new Error('Unknown error');
};

export const runCustomExportTransformer = (
  data: PeriodDetailsGiverReceiverDto[],
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  context: any,
  transformer: ExportTransformerMap
): Object[] => {
  const map = {
    item: transformer.map.item,
    operate: transformer.map.operate.map(
      (operateItem: ExportTransformerOperateItem) => {
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
