import { QueryInput } from '@shared/types';
import { UserDocument } from '@user/types';
import {
  PraiseImportUserAccountInput,
  UserAccountDocument,
  UserAccountDto,
} from '@useraccount/types';
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
  quantifier: UserDocument;
  score: number;
  dismissed: boolean;
  duplicatePraise?: PraiseDocument;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PraiseDocument extends Praise, mongoose.Document {}

export interface QuantificationDocument
  extends Quantification,
    mongoose.Document {}

export interface PraiseDto {
  _id: string;
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: QuantificationDto[];
  giver: UserAccountDto;
  receiver: UserAccountDto;
  createdAt: string;
  updatedAt: string;
}

export interface QuantificationDto {
  quantifier: string;
  score: number;
  dismissed: boolean;
  duplicatePraise?: string;
  duplicateScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type QuantificationDetailsDto = QuantificationDto;

export interface PraiseDetailsDto extends PraiseDto {
  score?: number;
  quantifications: QuantificationDetailsDto[];
}

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
  giver: PraiseImportUserAccountInput;
  receiver: PraiseImportUserAccountInput;
  reason: string;
  sourceId: string;
  sourceName: string;
}
