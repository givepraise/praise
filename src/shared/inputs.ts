import { Query } from './types';

export interface QueryInput extends Query {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
}
