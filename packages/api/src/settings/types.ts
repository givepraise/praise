import { Document } from 'mongoose';

export enum SettingGroup {
  APPLICATION,
  PERIOD_DEFAULT,
  DISCORD,
  CUSTOM_EXPORT,
}

interface Setting {
  key: string;
  value?: string;
  valueRealized?: string | boolean | number | number[] | string[];
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
  options?: string;
}

export interface SettingDocument extends Setting, Document {}

export interface SettingDto {
  _id: string;
  key: string;
  value?: string;
  valueRealized?: string | boolean | number | number[] | string[] | object;
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
  options?: string;
}

export interface SettingSetInput {
  value: string;
}
