import mongoose from 'mongoose';
import { SettingDocument } from './types';
import { fieldTypeValidator } from './validators';

export const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: {
      type: String,
      enum: ['Number', 'String', 'Textarea', 'Boolean', 'List', 'Image'],
      validate: fieldTypeValidator,
    },
    label: { type: String, required: true },
    description: { type: String },
  },
  {
    collection: 'settings',
  }
);

export const SettingsModel = mongoose.model<SettingDocument>(
  'Settings',
  settingsSchema
);
