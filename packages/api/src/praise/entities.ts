import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { PraiseDocument, QuantificationDocument } from './types';

export const quantificationSchema = new mongoose.Schema(
  {
    quantifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    dismissed: { type: Boolean, default: false },
    duplicatePraise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Praise',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const QuantificationModel = mongoose.model<QuantificationDocument>(
  'Quantification',
  quantificationSchema
);

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

const PraiseModel = mongoose.model<PraiseDocument, Pagination<PraiseDocument>>(
  'Praise',
  praiseSchema
);

export { PraiseModel, QuantificationModel };
