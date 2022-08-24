import { Document } from 'mongoose';

export enum SettingGroup {
  APPLICATION,
  PERIOD_DEFAULT,
  DISCORD,
  CUSTOM_EXPORT,
}

interface Setting {
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[] | string[];
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
}

export interface SettingDocument extends Setting, Document {}

interface Question {
  question: string;
  answer: string;
}

export interface FAQItem {
  section: string;
  questions: Question[];
}

export interface SettingDto {
  _id: string;
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[] | string[] | FAQItem[];
  type: string;
  label: string;
  description?: string;
  group: SettingGroup;
}

export interface SettingSetInput {
  value: string;
}
