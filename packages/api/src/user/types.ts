import { UserAccountDocument, UserAccountDto } from '@useraccount/types';
import mongoose from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
}

export interface User {
  ethereumAddress?: string;
  roles: UserRole[];
  accounts?: UserAccountDocument[];
  nonce?: string;
  accessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, mongoose.Document {}

export interface UserDto {
  _id: string;
  ethereumAddress?: string;
  roles: string[];
  accounts?: UserAccountDto[];
  nonce?: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleChangeInput {
  role: UserRole;
}
