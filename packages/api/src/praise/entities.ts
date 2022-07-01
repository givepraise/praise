import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { PraiseDocument, QuantificationDocument } from './types';

const quantificationSchema = new Schema(
  {
    quantifier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    score: { type: Number, default: 0, required: true },
    dismissed: { type: Boolean, default: false, required: true },
    duplicatePraise: {
      type: Schema.Types.ObjectId,
      ref: 'Praise',
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

const QuantificationModel = model<QuantificationDocument>(
  'Quantification',
  quantificationSchema
);

const praiseSchema = new Schema(
  {
    reason: { type: String, required: true },
    reasonRealized: { type: String, required: true },
    sourceId: { type: String, required: true },
    sourceName: { type: String, required: true },
    quantifications: [quantificationSchema],
    giver: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    forwarder: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

praiseSchema.plugin(mongoosePagination);

const PraiseModel = model<PraiseDocument, Pagination<PraiseDocument>>(
  'Praise',
  praiseSchema
);

export { PraiseModel, QuantificationModel };
