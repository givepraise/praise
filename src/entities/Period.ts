import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export interface PeriodInterface extends mongoose.Document {
  name: string;
  status: 'OPEN' | 'QUANTIFY' | 'CLOSED';
  endDate: Date;
  quantifiers: [string];
}

export interface PeriodDocument extends PeriodInterface {
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new mongoose.Schema<PeriodInterface>(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 64 },
    status: {
      type: String,
      enum: ['OPEN', 'QUANTIFY', 'CLOSED'],
      default: 'OPEN',
    },
    endDate: { type: Date, required: true },
    quantifiers: { type: [String] },
  },
  {
    timestamps: true,
  }
);

periodSchema.plugin(mongoosePagination);

const PeriodModel = mongoose.model<
  PeriodInterface,
  Pagination<PeriodInterface>
>('Period', periodSchema);

export default PeriodModel;
