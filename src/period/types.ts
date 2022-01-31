import mongoose from 'mongoose';

export interface Period {
  name: string;
  status: 'OPEN' | 'QUANTIFY' | 'CLOSED';
  endDate: Date;
  quantifiers: [string];
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodDocument extends Period, mongoose.Document {}

export interface Receiver {
  _id: string;
  praiseCount: number;
  praiseIds: string[];
  assignedQuantifiers?: number;
}

export interface Quantifier {
  _id?: string;
  receivers: Receiver[];
}

export interface PeriodCreateUpdateInput {
  name: string;
  endDate: string;
}
