import mongoose from 'mongoose';
import { SettingDocument } from './types';
import { fieldTypeValidator } from './validators';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
    type: {
      type: String,
      enum: ['Number', 'String', 'Textarea', 'Boolean', 'List', 'Image'],
      validate: fieldTypeValidator,
    },
    label: { type: String, required: true },
    description: { type: String },
    periodOverridable: { type: Boolean, default: false },
    period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Period',
      index: true,
      default: undefined,
    },
  },
  {
    collection: 'settings',
  }
);

settingsSchema.index({ key: 1, period: 1 }, { unique: true });

export const SettingsModel = mongoose.model<SettingDocument>(
  'Settings',
  settingsSchema
);
