import 'ses';
import { transform } from 'ses-node-json-transform';
import { ExportTransformer, PeriodDetailsGiverReceiverDto } from '../types';

if (process.env.NODE_ENV !== 'testing') {
  lockdown({ domainTaming: 'unsafe' });
}

export const runCustomExportTransformer = (
  data: PeriodDetailsGiverReceiverDto[],
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  context: any,
  transformer: ExportTransformer
): Object[] => {
  const result = transform(data, transformer.map, context);
  return result;
};
