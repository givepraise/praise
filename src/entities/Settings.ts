import mongoose from 'mongoose';

export interface SettingsInterface extends mongoose.Document {
  key: string;
  value: string;
}

export const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  {
    collection: 'settings',
  }
);

const SettingsModel = mongoose.model<SettingsInterface>(
  'Settings',
  settingsSchema
);

export default SettingsModel;
