import mongoose from 'mongoose';
import { SettingDocument, SettingGroup } from './types';
import { fieldTypeValidator } from './validators';

export const genericSettingsSchema = {
  key: { type: String, required: true },
  value: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'Integer',
      'Float',
      'String',
      'Textarea',
      'Boolean',
      'IntegerList',
      'Image',
      'QuestionAnswerJSON',
    ],
    validate: fieldTypeValidator,
    required: true,
  },
  label: { type: String, required: true },
  description: { type: String },
  group: { type: Number, enum: SettingGroup, required: true },
};

export function getGenericSettingValueRealized(
  this: SettingDocument
): string | boolean | number | number[] | undefined {
  if (!this) return undefined;

  let normalizedValue;
  if (this.type === 'Integer') {
    normalizedValue = Number.parseInt(this.value);
  } else if (this.type === 'Float') {
    normalizedValue = parseFloat(this.value);
  } else if (this.type === 'Boolean') {
    normalizedValue = this.value === 'true' ? true : false;
  } else if (this.type === 'IntegerList') {
    normalizedValue = this.value
      .split(',')
      .map((v: string) => Number.parseInt(v.trim()));
  } else if (this.type === 'Image') {
    normalizedValue = `${process.env.SERVER_URL as string}/${this.value}`;
  } else {
    normalizedValue = this.value;
  }

  return normalizedValue;
}

export const valueRealizedVirtualName = 'valueRealized';

const settingsSchema = new mongoose.Schema(
  {
    ...genericSettingsSchema,
  },
  {
    collection: 'settings',
  }
);

settingsSchema
  .virtual(valueRealizedVirtualName)
  .get(getGenericSettingValueRealized);

settingsSchema.index({ key: 1 }, { unique: true });

export const SettingsModel = mongoose.model<SettingDocument>(
  'Settings',
  settingsSchema
);
