import mongoose from 'mongoose';

export interface PeriodInput {
  name: string;
  status: string; // OPEN, QUANTIFY, CLOSED
  endDate: Date;
  quantifiers: [string];
}

export interface PeriodDocument extends PeriodInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const periodSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: {
      type: {
        type: String,
        enum: ['OPEN', 'QUANTIFY', 'CLOSED'],
      },
      default: ['OPEN'],
    },
    endDate: { type: Date, required: true },
    quantifiers: { type: [String] },
  },
  {
    timestamps: true,
  }
);

const PeriodModel = mongoose.model<PeriodDocument>('Period', periodSchema);

export default PeriodModel;
