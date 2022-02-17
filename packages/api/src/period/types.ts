import { QuantificationDocument, QuantificationDto } from '@praise/types';
import { Query } from '@shared/types';
import { UserAccountDocument, UserAccountDto } from '@useraccount/types';
import mongoose, { Types } from 'mongoose';

// export type PeriodStatusType = 'OPEN' | 'QUANTIFY' | 'CLOSED';

export enum PeriodStatusType {
  OPEN = 'OPEN',
  QUANTIFY = 'QUANTIFY',
  CLOSED = 'CLOSED',
}

export interface Period {
  name: string;
  status: PeriodStatusType;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodDocument extends Period, mongoose.Document {}

export interface PeriodDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodDetailsReceiver {
  _id: Types.ObjectId;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDocument>>;
  score?: number;
  userAccounts: UserAccountDocument[];
}

export interface PeriodDetailsReceiverDto {
  _id: string;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDto>>;
  score?: number;
  userAccount?: UserAccountDto;
}

// export interface PeriodDetailsQuantifier {
//   user: User;
//   finishedCount: number;
//   praiseCount: number;
// }

export interface PeriodDetailsQuantifierDto {
  _id: string;
  finishedCount: number;
  praiseCount: number;
}

export interface PeriodDetailsDto extends PeriodDto {
  quantifiers?: PeriodDetailsQuantifierDto[];
  receivers?: PeriodDetailsReceiverDto[];
}

export interface VerifyQuantifierPoolSizeResponse {
  quantifierPoolSize: number;
  requiredPoolSize: number;
}

export interface PeriodCreateUpdateInput {
  _id?: string;
  name: string;
  endDate: string;
}

export interface PeriodReceiverPraiseInput extends Query {
  receiverId?: string;
}

export interface PeriodQuantifierPraiseInput extends Query {
  quantifierId?: string;
}
