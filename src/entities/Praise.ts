import mongoose from 'mongoose';
import { PeriodInterface } from './Period';
import { AccountSchema, UserAccountInterface } from './User';

export interface QuantificationInterface {
  createdAt: string;
  updatedAt: string;
  quantifier: UserAccountInterface;
  score: number;
  dismissed: boolean;
  duplicatePraise: PraiseInterface;
}

export interface PraiseInterface {
  period: PeriodInterface;
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: Array<QuantificationInterface>;
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
}

export interface PraiseDocument extends PraiseInterface, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const QuantificationSchema = new mongoose.Schema(
  {
    quantifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    dismissed: { type: Boolean, required: true, default: false },
    duplicatePraise: { type: mongoose.Schema.Types.ObjectId, ref: 'Praise' },
  },
  {
    timestamps: true,
  }
);

const praiseSchema = new mongoose.Schema(
  {
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' },
    reason: { type: String, required: true },
    quantifications: [QuantificationSchema],
    giver: { type: AccountSchema, required: true },
    receiver: { type: AccountSchema, required: true },
  },
  {
    timestamps: true,
  }
);

const PraiseModel = mongoose.model<PraiseDocument>('Praise', praiseSchema);

export default PraiseModel;
