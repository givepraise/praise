import mongoose from 'mongoose';

export interface Setting {
  key: string;
  value: string;
}

export interface SettingDocument extends Setting, mongoose.Document {}

export interface SettingSetInput {
  value: string;
}
