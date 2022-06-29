import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { PeriodDocument, PeriodStatusType } from '@period/types';
import { endDateValidators } from './validators';

const periodSchema = new Schema<PeriodDocument>(
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

periodSchema.plugin(mongoosePagination);

const PeriodModel = model<PeriodDocument, Pagination<PeriodDocument>>(
  'Period',
  periodSchema
);

export { PeriodModel };
