import mongoose from 'mongoose';

export interface PeriodSetting {
  key: string;
  value: string;
  valueRealized: string | boolean | number | number[];
  type: string;
  label: string;
  description?: string;
  period: boolean;
}

export interface PeriodSettingDocument extends PeriodSetting, mongoose.Document {}
