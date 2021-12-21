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
    quantifierId: { type: String, required: true },
    score: { type: Number, required: true },
    dismissed: { type: Boolean, required: true, default: false },
    duplicatePraiseId: { type: String },
  },
  {
    timestamps: true,
  }
);

const praiseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    periodId: { type: String, required: true },
    reason: { type: String, required: true },
    quantifications: [QuantificationSchema],
    giver: AccountSchema,
    receiver: AccountSchema,
  },
  {
    timestamps: true,
  }
);

const PraiseModel = mongoose.model<PraiseDocument>('User', praiseSchema);

export default PraiseModel;
