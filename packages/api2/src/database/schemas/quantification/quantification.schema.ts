import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const QuantificationSchema = new Schema({
  _id: {
    type: ObjectId,
    required: true,
    set: (value: string) => value.toString(),
    auto: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  scoreRealized: {
    type: Number,
    required: true,
    default: 0,
  },
  dismissed: {
    type: Boolean,
    required: true,
  },
  duplicatePraise: {
    type: ObjectId,
    ref: 'Praise',
  },
  quantifier: {
    type: ObjectId,
    ref: 'UserAccount',
  },
  praise: {
    type: ObjectId,
    ref: 'Praise',
    required: true,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

export const QuantificationModel = model(
  'Quantification',
  QuantificationSchema,
);
