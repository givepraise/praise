import { Document, Model, Types } from 'mongoose';
import { PaginationModel, PaginationOptions } from 'mongoose-paginate-ts';
import {
  Quantifier,
  QuantificationDocument,
  QuantificationDto,
  Quantification,
  PraiseDto,
} from '@/praise/types';
import { Query } from '@/shared/types';
import { UserAccountDocument, UserAccountDto } from '@/useraccount/types';
import { PeriodSettingDto } from '@/periodsettings/types';

export enum PeriodStatusType {
  OPEN = 'OPEN',
  QUANTIFY = 'QUANTIFY',
  CLOSED = 'CLOSED',
}

interface Period {
  name: string;
  status: PeriodStatusType;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodDocument extends Period, Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $__: any;
}

export interface PaginatedPeriodModel extends Model<PeriodDocument> {
  getLatest: () => Promise<PeriodDocument>;
  paginate(
    options?: PaginationOptions | undefined,
    onError?: Function | undefined
  ): Promise<PaginationModel<PeriodDocument> | undefined>;
}

export interface PeriodDetailsGiverReceiver {
  _id: Types.ObjectId;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDocument>>;
  scoreRealized: number;
  userAccounts: UserAccountDocument[];
}

export interface PeriodDetailsGiverReceiverDto {
  _id: string;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDto>>;
  ethereumAddress?: string;
  scoreRealized: number;
  userAccount?: UserAccountDto;
}

export interface PeriodDetailsQuantifier {
  _id: string;
  quantifications: Array<Quantification>;
  praiseCount: number;
}

export interface PeriodDetailsQuantifierDto {
  _id: string;
  finishedCount: number;
  praiseCount: number;
}

export interface PeriodDetailsDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  quantifiers?: PeriodDetailsQuantifierDto[];
  givers?: PeriodDetailsGiverReceiverDto[];
  receivers?: PeriodDetailsGiverReceiverDto[];
  settings?: PeriodSettingDto[];
}

export interface VerifyQuantifierPoolSizeResponse {
  quantifierPoolSize: number;
  quantifierPoolSizeNeeded: number;
  quantifierPoolDeficitSize: number;
}

export interface PeriodCreateInput {
  name: string;
  endDate: string;
}

export interface PeriodUpdateInput {
  _id: string;
  name?: string;
  endDate?: string;
}

export interface PeriodReceiverPraiseInput extends Query {
  receiverId?: string;
}

export interface PeriodQuantifierPraiseInput extends Query {
  quantifierId?: string;
}

export interface Assignments {
  poolAssignments: Quantifier[];
  remainingAssignmentsCount: number;
  remainingPraiseCount: number;
}

export interface PeriodDateRange {
  $gt: Date;
  $lte: Date;
}

export interface PeriodReplaceQuantifierDto {
  period: PeriodDetailsDto;
  praises: PraiseDto[];
}

export interface ReplaceQuantifierRequestBody {
  currentQuantifierId: string;
  newQuantifierId: string;
}

export interface TransformerOperateItem {
  run: string;
  on: string;
}

export interface TransformerMap {
  name: string;
  map: {
    item: Object;
    operate: TransformerOperateItem[];
    each: string;
  };
  context: {
    budget: number;
    tokean: string;
  };
}
