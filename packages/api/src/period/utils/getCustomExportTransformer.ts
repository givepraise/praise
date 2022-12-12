import axios, { AxiosResponse } from 'axios';
import { TransformerMapOperateItem } from 'ses-node-json-transform';
import { ExportTransformer } from '../types';

export const getCustomExportTransformer = async (
  url: string
): Promise<ExportTransformer> => {
  let response: AxiosResponse | undefined = undefined;
  try {
    response = await axios.get(url);
  } catch (error) {
    throw new Error('Could not fetch custom export transformer.');
  }

  // TODO add schema validation
  if (response) {
    const transformerDto = response.data as ExportTransformer;
    try {
      const transformer: ExportTransformer = {
        ...transformerDto,
        map: {
          item: transformerDto.map.item,
          operate: transformerDto.map.operate.map(
            (operateItem: TransformerMapOperateItem) => {
              return {
                run: operateItem.run,
                on: operateItem.on,
              };
            }
          ),
          each: transformerDto.map.each,
        },
      };
      return transformer;
    } catch (error) {
      throw new Error('Could not parse custom export transformer.');
    }
  }

  throw new Error('Unknown error');
};
