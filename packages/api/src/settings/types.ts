import mongoose from 'mongoose';

export interface Setting {
  key: string;
  value: string;
  type: string;
  label: string;
  description?: string;
  periodOverridable: boolean;
}

export interface SettingDocument extends Setting, mongoose.Document {}

export interface SettingDto {
  _id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  description?: string;
}

export interface SettingSetInput {
  value: string;
}
