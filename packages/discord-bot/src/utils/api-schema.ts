import { components } from 'api-types';

interface UserAccountNoUserId {
  _id: string;
  user: string | User;
  accountId: string;
  name: string;
  avatarId: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  identityEthAddress: string;
  rewardsEthAddress: string;
  username: string;
  roles: string[];
  accounts: UserAccountNoUserId[];
  createdAt: string;
  updatedAt: string;
}

export type CreateUserAccountInputDto =
  components['schemas']['CreateUserAccountInputDto'];
export type UpdateUserAccountInputDto =
  components['schemas']['UpdateUserAccountInputDto'];

export type UserAccount = components['schemas']['UserAccount'];

// export interface UserAccount {
//   _id: string;
//   user: string | User;
//   accountId: string;
//   name: string;
//   avatarId: string;
//   platform: string;
//   createdAt: string;
//   updatedAt: string;
//   activateToken?: string;
// }

export interface UserAccountWithActivateToken {
  _id: string;
  user: string | User;
  accountId: string;
  name: string;
  avatarId: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  activateToken: string;
}

export interface PraiseItem {
  limit: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  hasMore: boolean;
  totalDocs: number;
  totalPages: number;
  page: number;
  pageCounter: number;
}

export interface Setting {
  _id: string;
  key: string;
  value: string;
  valueRealized: Record<string, never>;
  defaultValue: string;
  type:
    | 'Integer'
    | 'Float'
    | 'String'
    | 'Textarea'
    | 'Boolean'
    | 'IntegerList'
    | 'StringList'
    | 'Image'
    | 'Radio'
    | 'JSON';
  label: string;
  description: string;
  group: number;
  options: string;
  subgroup: number;
  periodOverridable: boolean;
}

export interface Praise {
  _id: string;
  reasonRaw: string;
  reason: string;
  sourceId: string;
  sourceName: string;
  score: number;
  receiver: UserAccount;
  giver: UserAccount;
  forwarder: UserAccount;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
  FORWARDER = 'FORWARDER',
}

export interface Community {
  _id: string;
  name: string;
  discordGuildId: string;
  discordLinkNonce: string;
  isPublic: boolean;
  discordLinkState: string;
  hostname: string;
}

export interface PaginatedCommunities {
  docs: Community[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}
