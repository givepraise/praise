import { TransformerMap } from './transformer-map.interface';

export interface ExportTransformer {
  name: string;
  map: TransformerMap;
  context: {};
  filterColumn: string;
  includeCsvHeaderRow?: boolean;
}
