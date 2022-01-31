import mongoose from 'mongoose';
import { SettingsDocument } from './types';

export const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  {
    collection: 'settings',
  }
);

const SettingsModel = mongoose.model<SettingsDocument>(
  'Settings',
  settingsSchema
);

export { SettingsModel };
