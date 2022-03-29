import mongoose from 'mongoose';

export type SettingValueNormalTypes = string | boolean | number | number[];
export interface Setting {
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
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
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
}

export interface SettingSetInput {
  value: string;
}
