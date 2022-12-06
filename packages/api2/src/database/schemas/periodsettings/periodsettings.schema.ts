import mongoose from 'mongoose';
import { PeriodSchema } from '../period/period.schema';
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

export const PeriodSettingsSchema = new Schema(
  {
    ...PeriodSchema,
    period: {
      type: ObjectId,
      ref: 'Period',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
