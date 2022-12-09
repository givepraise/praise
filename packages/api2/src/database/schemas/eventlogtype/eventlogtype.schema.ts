import mongoose from 'mongoose';
import { EventLogTypeKey } from '../../../eventlogs/interfaces/eventlog-type.interface';
const { Schema, model } = mongoose;

const EventLogTypeSchema = new Schema(
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
  },
);

export const EventLogTypeModel = model('EventLogType', EventLogTypeSchema);
