import mongoose from 'mongoose';
import { SettingDocument } from './types';
import { fieldTypeValidator } from './validators';

const settingsSchema = new mongoose.Schema(
  {
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
      ],
      validate: fieldTypeValidator,
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String },
    periodOverridable: { type: Boolean, default: false },
    period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Period',
      index: true,
      default: undefined,
    },
  },
  {
    collection: 'settings',
  }
);

settingsSchema
  .virtual('valueNormalized')
  .get(function (
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
  });

settingsSchema.index({ key: 1, period: 1 }, { unique: true });

export const SettingsModel = mongoose.model<SettingDocument>(
  'Settings',
  settingsSchema
);
