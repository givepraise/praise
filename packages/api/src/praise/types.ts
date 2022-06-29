import { Document } from 'mongoose';
import { QueryInput } from '@shared/types';
import { UserDocument } from '@user/types';
import {
  PraiseImportUserAccountInput,
  UserAccountDocument,
  UserAccountDto,
} from '@useraccount/types';

interface Praise {
  reason: string;
  reasonRealized: string;
  sourceId: string;
  sourceName: string;
  quantifications: QuantificationDocument[];
  giver: UserAccountDocument;
  receiver: UserAccountDocument;
  forwarder?: UserAccountDocument;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quantification {
  quantifier: UserDocument;
  score: number;
  dismissed: boolean;
  duplicatePraise?: PraiseDocument;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

export interface PraiseDocument extends Praise, Document {}

export interface QuantificationDocument extends Quantification, Document {}

export interface PraiseDto {
  _id: string;
  reasonRealized: string;
  sourceId: string;
  sourceName: string;
  quantifications: QuantificationDto[];
  giver: UserAccountDto;
  receiver: UserAccountDto;
  forwarder?: UserAccountDto;
  createdAt: string;
  updatedAt: string;
  scoreRealized: number;
}

export interface PraiseDtoExtended extends PraiseDto {
  receiverUserDocument?: UserDocument;
  giverUserDocument?: UserDocument;
}

export interface QuantificationDto {
  quantifier: string;
  score: number;
  scoreRealized?: number;
  dismissed: boolean;
  duplicatePraise?: string;
  createdAt: string;
  updatedAt: string;
}
export interface PraiseDetailsDto extends PraiseDto {
  quantifications: QuantificationDto[];
}

export interface QuantificationCreateUpdateInput {
  score: number;
  dismissed: boolean;
  duplicatePraise: string;
}

export interface Receiver {
  _id: string;
  praiseCount: number;
  praiseIds: string[];
  assignedQuantifiers?: number;
}

export interface Quantifier {
  _id: string;
  accounts: UserAccountDocument[];
  receivers: Receiver[];
}

export interface QuantifierPoolById {
  [index: string]: Quantifier;
}

export interface PraiseAllInput extends QueryInput {
  receiver?: string;
}

export interface PraiseImportInput {
  createdAt: string;
  giver: PraiseImportUserAccountInput;
  receiver: PraiseImportUserAccountInput;
  reason: string;
  reasonRealized: string;
  sourceId: string;
  sourceName: string;
}

export interface PraiseExportInput {
  receiver?: string;
  createdAt?: {
    $gt: string;
    $lte: string;
  };
}
