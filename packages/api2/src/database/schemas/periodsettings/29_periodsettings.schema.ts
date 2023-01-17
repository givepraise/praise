import { SettingGroup } from '../../../settings/enums/setting-group.enum';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const PeriodSettingsSchema = new Schema({
  _id: {
    type: ObjectId,
    required: true,
    set: (value: string) => value.toString(),
  },
  value: { type: String, required: false },
  period: {
    type: ObjectId,
    ref: 'Period',
    required: true,
    index: true,
  },
  setting: {
    type: ObjectId,
    ref: 'Period',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'Integer',
      'Float',
      'String',
      'Textarea',
      'Boolean',
      'IntegerList',
      'StringList',
      'Image',
      'Radio',
      'JSON',
    ],
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

delete mongoose.models['PeriodSettings'];
export const PeriodSettingsModel = model(
  'PeriodSettings',
  PeriodSettingsSchema,
);
