/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Model, Types } from 'mongoose';
import { PaginationModel, PaginationOptions } from 'mongoose-paginate-ts';
import { TransformerMap } from 'ses-node-json-transform';
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
  username?: string;
}

export interface PeriodDetailsGiverReceiverDto {
  _id: string;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDto>>;
  identityEthAddress?: string;
  rewardsEthAddress?: string;
  scoreRealized: number;
  userAccount?: UserAccountDto;
  username?: string;
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

export interface PeriodGiverPraiseInput extends Query {
  giverId?: string;
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

export interface ExportTransformer {
  name: string;
  map: TransformerMap;
  context: {};
  filterColumn: string;
  includeCsvHeaderRow?: boolean;
}

export interface ExportCustomQueryInput {
  context?: string;
}

export interface ExportCustomQueryInputParsedQs
  extends ExportCustomQueryInput,
    Query {}
