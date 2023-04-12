import { EventLogTypeKey } from '../../../event-log/enums/event-log-type-key';
import mongoose from 'mongoose';
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

delete mongoose.models['EventLogType'];
export const EventLogTypeModel = model('EventLogType', EventLogTypeSchema);
