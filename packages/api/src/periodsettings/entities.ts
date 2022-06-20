import { Schema, model } from 'mongoose';
import { PeriodSettingDocument } from './types';
import {
  genericSettingsSchema,
  getGenericSettingValueRealized,
  valueRealizedVirtualName,
} from '@settings/entities';

const periodSettingsSchema = new Schema(
  {
    ...genericSettingsSchema,
    period: {
      type: Schema.Types.ObjectId,
      ref: 'Period',
      index: true,
      required: true,
    },
  },
  {
    collection: 'periodsettings',
  }
);

periodSettingsSchema
  .virtual(valueRealizedVirtualName)
  .get(getGenericSettingValueRealized);

periodSettingsSchema.index({ key: 1, period: 1 }, { unique: true });

export const PeriodSettingsModel = model<PeriodSettingDocument>(
  'PeriodSettings',
  periodSettingsSchema
);
