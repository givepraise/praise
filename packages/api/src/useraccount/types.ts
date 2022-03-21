/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserDocument } from '@user/types';
import mongoose from 'mongoose';

export type UserAccountPlatform = 'DISCORD' | 'TELGRAM';

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

export interface UserAccountDocument extends UserAccount, mongoose.Document {
  ethAddress: string | undefined;
}

export interface UserAccountDto {
  ethAddress: string | undefined;
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
