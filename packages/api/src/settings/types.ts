import mongoose from 'mongoose';

export enum SettingGroup {
  APPLICATION,
  PERIOD_DEFAULT,
  DISCORD,
}

export interface Setting {
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
}

export interface SettingDocument extends Setting, mongoose.Document {}

export interface SettingDto {
  _id: string;
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
}

export interface SettingSetInput {
  value: string;
}
