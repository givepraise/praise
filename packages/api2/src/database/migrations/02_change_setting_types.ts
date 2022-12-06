import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/01_settings.schema';

const settings = [
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    originalType: 'Number',
    newType: 'Integer',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    originalType: 'Number',
    newType: 'Integer',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    originalType: 'Number',
    newType: 'Float',
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    originaltype: 'List',
    newType: 'IntegerList',
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateMany: {
      filter: { key: s.key },
      update: { $set: { type: s.newType } },
    },
  })) as any;

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateMany: {
      filter: { key: s.key },
      update: { $set: { type: s.originalType } },
    },
  })) as any;

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.bulkWrite(settingUpdates);
};

export { up, down };
