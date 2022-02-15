import { Quantification } from '@praise/types';
import mongoose from 'mongoose';

type periodStatusType = 'OPEN' | 'QUANTIFY' | 'CLOSED';

export interface Period {
  _id?: string;
  name: string;
  status: periodStatusType;
  endDate: Date;
  quantifiers: [string];
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodDocument extends Period, mongoose.Document<string> {}

export interface PeriodDto {
  _id?: string;
  name: string;
  status: periodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodDetailsReceiver {
  _id?: string;
  praiseCount: number;
  quantifications?: [Quantification[]];
  score?: number;
}
export interface PeriodDetailsQuantifier {
  _id?: string;
  finishedCount: number;
  praiseCount: number;
}
export interface PeriodDetailsDto extends PeriodDto {
  quantifiers: PeriodDetailsQuantifier[];
  receivers: PeriodDetailsReceiver[];
}

export interface VerifyQuantifierPoolSizeResponse {
  quantifierPoolSize: number;
  requiredPoolSize: number;
}

export interface PeriodCreateUpdateInput {
  name: string;
  endDate: string;
}
