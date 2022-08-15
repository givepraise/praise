import { Schema, model } from 'mongoose';
import { mongoosePagination } from 'mongoose-paginate-ts';
import {
  PaginatedPeriodModel,
  PeriodDocument,
  PeriodStatusType,
} from '@/period/types';
import { endDateValidators } from './validators';

const PeriodSchema = new Schema<PeriodDocument>(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 64 },
    status: {
      type: String,
      enum: PeriodStatusType,
      default: PeriodStatusType.OPEN,
    },
    endDate: {
      type: Date,
      required: true,
      validate: endDateValidators,
    },
  },
  {
    timestamps: true,
  }
);

PeriodSchema.statics.getLatest = function (): PeriodDocument {
  return this.findOne({}).sort({ endDate: -1 });
};

PeriodSchema.plugin(mongoosePagination);

export const PeriodModel = model<PeriodDocument, PaginatedPeriodModel>(
  'Period',
  PeriodSchema
);
