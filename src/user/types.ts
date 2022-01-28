import { QueryInput } from '@shared/inputs';
import mongoose from 'mongoose';
import { UserAccountDocument } from 'src/useraccount/types';

export interface User {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id?: any;
  ethereumAddress?: string;
  accounts: UserAccountDocument[];
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  nonce?: string;
  accessToken?: string;
}

export interface UserDocument extends User, mongoose.Document {}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
}

export interface RoleChangeRequest {
  role: UserRole;
}

export interface UserSearchQuery extends QueryInput {
  search: string;
}
