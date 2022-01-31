import mongoose from 'mongoose';

export interface Settings {
  key: string;
  value: string;
}

export interface SettingsDocument extends Settings, mongoose.Document {}

export interface SettingsSetInput {
  value: string;
}
