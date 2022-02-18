import mongoose from 'mongoose';
import { SettingDocument } from './types';

export const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    type: {
      type: String,
      enum: ['Number', 'String', 'Textarea', 'Boolean', 'File'],
    },
  },
  {
    collection: 'settings',
  }
);

export const SettingsModel = mongoose.model<SettingDocument>(
  'Settings',
  settingsSchema
);
