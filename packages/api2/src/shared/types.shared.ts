import { TransformerMap } from 'ses-node-json-transform';

export interface ExportTransformer {
  name: string;
  map: TransformerMap;
  context: Record<string, unknown>;
  filterColumn: string;
  includeCsvHeaderRow?: boolean;
}

export interface PaginatedResponseBody<T> {
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  hasPrevPage?: Boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  hasNextPage?: Boolean;
  prevPage?: number;
  nextPage?: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  hasMore?: Boolean;
  docs: T[];
}
