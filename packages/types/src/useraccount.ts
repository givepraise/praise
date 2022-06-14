/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDocument } from './user';
import { Document } from 'mongoose';

export type UserAccountPlatform = 'DISCORD' | 'TELEGRAM';

export interface UserAccount {
  user?: UserDocument;
  accountId: string;
  name: string;
  avatarId?: string;
  platform: UserAccountPlatform;
  activateToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccountDocument extends UserAccount, Document {}

export interface UserAccountDto {
  _id: string;
  user?: string;
  accountId: string;
  name: string;
  avatarId?: string;
  platform: UserAccountPlatform;
  activateToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PraiseImportUserAccountInput {
  accountId: string;
  name: string;
  avatarId?: string;
  platform: UserAccountPlatform;
}
