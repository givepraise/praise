import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import {
  EventLogDocument,
  EventLogTypeDocument,
  EventLogTypeKey,
} from './types';

const eventLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    useraccount: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      index: true,
    },

    // "Related Period" of an eventlog - only used for quantification events
    //    which are restricted to ADMIN users when period is active
    period: {
      type: Schema.Types.ObjectId,
      ref: 'Period',
      index: true,
    },

    type: {
      type: Schema.Types.ObjectId,
      ref: 'EventLogType',
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

export const EventLogModel = model<
  EventLogDocument,
  Pagination<EventLogDocument>
>('EventLog', eventLogSchema);

const eventLogTypeSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: Object.values(EventLogTypeKey),
    },
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const EventLogTypeModel = model<
  EventLogTypeDocument,
  Pagination<EventLogTypeDocument>
>('EventLogType', eventLogTypeSchema);
