import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { EventLogDocument, EventLogTypeDocument } from './types';

export const eventLogSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      index: true,
    },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

eventLogSchema.plugin(mongoosePagination);

export const EventLogModel = mongoose.model<
  EventLogDocument,
  Pagination<EventLogDocument>
>('EventLog', eventLogSchema);

export const eventLogTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const EventLogTypeModel = mongoose.model<
  EventLogTypeDocument,
  Pagination<EventLogTypeDocument>
>('EventLogType', eventLogSchema);
