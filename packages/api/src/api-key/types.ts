import { Document } from 'mongoose';
// import { UserAccountDocument, UserAccountDto } from '@/useraccount/types';

export enum ApiKeyAccess {
  FULL = 'FULL',
  LIMITED = 'LIMITED',
}

interface ApiKey {
  access: ApiKeyAccess[];
  apikey?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyDocument extends ApiKey, Document {}

export interface ApiKeyDto {
  _id: string;
  access: ApiKeyAccess[];
  apikey?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
