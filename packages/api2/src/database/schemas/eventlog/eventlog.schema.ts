import mongoose from 'mongoose';
const { Schema } = mongoose;

export const EventLogSchema = new Schema(
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
  },
);
