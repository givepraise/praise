import { Document } from 'mongoose';

export interface PeriodSetting {
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
  period: string;
  options?: string;
}

export interface PeriodSettingDocument extends PeriodSetting, Document {}

export interface PeriodSettingDto {
  _id: string;
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
  period: string;
  options?: string;
}
