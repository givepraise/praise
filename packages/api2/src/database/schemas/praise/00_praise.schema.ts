import mongoose from 'mongoose';
import { QuantificationSchema } from '../quantification/quantification.schema';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const PraiseSchema = new Schema({
  _id: {
    type: ObjectId,
    required: true,
    set: (value: string) => value.toString(),
  },
  reason: {
    type: String,
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
  },
  sourceName: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  receiver: {
    type: ObjectId,
    ref: 'UserAccount',
  },
  giver: {
    type: ObjectId,
    ref: 'UserAccount',
  },
  forwarder: {
    type: ObjectId,
    ref: 'UserAccount',
  },
  quantifications: [QuantificationSchema],
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

delete mongoose.models['Praise'];
export const PraiseModel = model('Praise', PraiseSchema);
