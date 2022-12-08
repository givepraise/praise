import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const PeriodSchema = new Schema(
  {
    _id: {
      type: ObjectId,
      required: true,
      set: (value: string) => value.toString(),
    },
    name: { type: String, required: true, minlength: 3, maxlength: 64 },
    status: {
      type: String,
      enum: PeriodStatusType,
      default: PeriodStatusType.OPEN,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PeriodModel = model('Period', PeriodSchema);
