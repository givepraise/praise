import { Schema, model } from 'mongoose';
import { SettingDocument, SettingGroup } from './types';
import { isSettingValueAllowedBySettingType } from './validators';

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
      'Object',
    ],
    validate: isSettingValueAllowedBySettingType,
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

  let realizedValue;
  if (this.type === 'Integer') {
    realizedValue = Number.parseInt(this.value);
  } else if (this.type === 'Float') {
    realizedValue = parseFloat(this.value);
  } else if (this.type === 'Boolean') {
    realizedValue = this.value === 'true' ? true : false;
  } else if (this.type === 'IntegerList') {
    realizedValue = this.value
      .split(',')
      .map((v: string) => Number.parseInt(v.trim()));
  } else if (this.type === 'Image') {
    realizedValue = `${process.env.SERVER_URL as string}/${this.value}`;
  } else if (this.type === 'QuestionAnswerJSON') {
    realizedValue = this.value ? JSON.parse(this.value) : [];
  } else {
    realizedValue = this.value;
  }

  return realizedValue;
}

export const valueRealizedVirtualName = 'valueRealized';

const settingsSchema = new Schema(
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

export const SettingsModel = model<SettingDocument>('Settings', settingsSchema);
