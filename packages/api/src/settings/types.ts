import { Document } from 'mongoose';

export enum SettingGroup {
  APPLICATION,
  PERIOD_DEFAULT,
  DISCORD,
  CUSTOM_EXPORT,
}

interface Setting {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  value?: string;
  valueRealized?: string | boolean | number | number[] | string[];
  type: string;
  options?: string;
  group: SettingGroup;
  subgroup: number;
}

export interface SettingDocument extends Setting, Document {}

export interface SettingDto {
  _id: string;
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  value?: string;
  valueRealized?: string | boolean | number | number[] | string[] | object;
  type: string;
  options?: string;
  group: SettingGroup;
  subgroup: number;
}

export interface SettingSetInput {
  value: string;
}

export interface ExportContext {
  totalPraiseScore: number;
  praiseItemsCount: number;
}
