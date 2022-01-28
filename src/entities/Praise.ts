import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccountInterface } from '../useraccount/entities';
import {
  QuantificationInterface,
  quantificationSchema,
} from './Quantification';

export interface PraiseInterface extends mongoose.Document {
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: QuantificationInterface[];
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
  createdAt: Date;
  updatedAt: Date;
}

const praiseSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true },
    sourceId: { type: String, required: true },
    sourceName: { type: String, required: true },
    quantifications: [quantificationSchema],
    giver: { type: Schema.Types.ObjectId, ref: 'UserAccount' },
    receiver: { type: Schema.Types.ObjectId, ref: 'UserAccount' },
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
