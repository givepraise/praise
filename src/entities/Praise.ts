import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserInterface } from './User';
import { UserAccountInterface } from './UserAccount';

export interface QuantificationInterface {
  createdAt: string;
  updatedAt: string;
  quantifier: UserInterface;
  score: number;
  dismissed: boolean;
  duplicatePraise: PraiseInterface;
}

export interface PraiseInterface extends mongoose.Document {
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: Array<QuantificationInterface>;
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
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
    reason: { type: String, required: true },
    quantifications: [QuantificationSchema],
    giver: { type: Schema.Types.ObjectId, ref: 'Giver' },
    receiver: { type: Schema.Types.ObjectId, ref: 'Receiver' },
  },
  {
    timestamps: true,
  }
);

praiseSchema.plugin(mongoosePagination);

const PraiseModel = mongoose.model<
  PraiseInterface,
  Pagination<PraiseInterface>
>('Praise', praiseSchema);

export default PraiseModel;
