import { UserRole } from '@entities/User';
import { UserAccountInterface } from '@entities/UserAccount';
export type Query = core.Query;

export interface QueryInput extends core.Query {
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

export interface AddRoleInput {
  role: UserRole;
}

export interface RemoveRoleInput {
  role: UserRole;
}

export interface SettingsSetInput {
  value: string;
}
