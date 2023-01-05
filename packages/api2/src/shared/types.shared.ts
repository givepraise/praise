import { TransformerMap } from 'ses-node-json-transform';

export interface ExportTransformer {
  name: string;
  map: TransformerMap;
  context: Record<string, unknown>;
  filterColumn: string;
  includeCsvHeaderRow?: boolean;
}
