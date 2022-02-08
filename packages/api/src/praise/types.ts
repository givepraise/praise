import { QueryInput } from '@shared/types';
import { UserDocument } from '@user/types';
import { UserAccountDocument } from '@useraccount/types';
import mongoose from 'mongoose';

export interface Praise {
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: Quantification[];
  giver: UserAccountDocument;
  receiver: UserAccountDocument;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quantification {
  createdAt?: string;
  updatedAt?: string;
  quantifier: UserDocument;
  score?: number;
  dismissed?: boolean;
  duplicatePraise?: PraiseDocument | null;
}

export interface QuantificationDocument
  extends Quantification,
    mongoose.Document {}

export interface PraiseDocument extends Praise, mongoose.Document {}

export interface QuantificationCreateUpdateInput {
  score: number;
  dismissed: boolean;
  duplicatePraise: string;
}

export interface PraiseAllInput extends QueryInput {
  receiver?: string;
  perdiodStart?: string;
  periodEnd?: string;
}

export interface PraiseImportInput {
  createdAt: string;
  giver: UserAccountDocument;
  receiver: UserAccountDocument;
  reason: string;
  sourceId: string;
  sourceName: string;
}
