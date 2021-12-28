import { UserRole } from '@entities/User';
import { Query } from './types';

export interface QueryInput extends Query {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
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
