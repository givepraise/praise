import mongoose from 'mongoose';
import { AccountSchema, UserAccountInterface } from './User';

export interface QuantificationInterface {
  createdAt: string;
  updatedAt: string;
  quantifierId: string;
  score: number;
  dismissed: boolean;
  duplicatePraiseId: string;
}

export interface PraiseInputInterface {
  periodId: number;
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: Array<QuantificationInterface>;
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
}

export interface PraiseDocument
  extends PraiseInputInterface,
    mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const QuantificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    quantifierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    dismissed: { type: Boolean, required: true, default: false },
    duplicatePraiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Praise' },
  },
  {
    timestamps: true,
  }
);

const praiseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    periodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' },
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
