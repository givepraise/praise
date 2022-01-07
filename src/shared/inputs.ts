import { UserRole } from '@entities/User';
import { UserAccountInterface } from '@entities/UserAccount';
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

interface PraiseSourceInterface {
  id: string;
  name: string;
  channelId: string;
  channelName: string;
  platform: string;
}

export interface PraiseImportInput {
  giver: UserAccountInterface;
  recipients: Array<UserAccountInterface>;
  praiseReason: string;
  source: PraiseSourceInterface;
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
