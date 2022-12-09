import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const PeriodSettingsSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: false },
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
  label: { type: String, required: true },
  description: { type: String },
  period: {
    type: ObjectId,
    ref: 'Period',
    required: true,
    index: true,
  },
});

delete mongoose.models['PeriodSettings'];
export const PeriodSettingsModel = model(
  'PeriodSettings',
  PeriodSettingsSchema,
);
