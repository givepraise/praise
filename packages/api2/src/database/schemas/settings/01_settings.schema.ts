import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const SettingSchema = new Schema({
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
});

delete mongoose.models['Setting'];
export const SettingModel = model('Setting', SettingSchema);
