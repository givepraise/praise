import { UserAccountInterface } from 'src/useraccount/entities';
import { Query } from './types';

export interface QueryInput extends Query {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
}

export interface PeriodCreateUpdateInput {
  name: string;
  endDate: string;
}

export interface QuantificationCreateUpdateInput {
  score: number;
  dismissed: boolean;
  duplicatePraiseId: string;
}

export interface PraiseImportInput {
  createdAt: string;
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
  reason: string;
  sourceId: string;
  sourceName: string;
}

export interface SearchQueryInput extends QueryInput {
  search: string;
}

export interface SettingsSetInput {
  value: string;
}
