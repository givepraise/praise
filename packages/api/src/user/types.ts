import { UserAccountDocument } from '@useraccount/types';
import mongoose from 'mongoose';

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

export interface RoleChangeRequestInput {
  role: UserRole;
}
