/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document } from 'mongoose';
import { UserDocument } from '@/user/types';

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
  nameRealized: string;
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
