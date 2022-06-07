import { SettingGroup } from '../../settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    value: false,
    type: 'Boolean',
    label: 'Assign praise to all quantifiers',
    description:
      'Evenly assign praise among all quantifiers. If enabled, the setting "Quantifiers Per Praise" will be ignored',
    group: SettingGroup.PERIOD_DEFAULT,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert setting if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
