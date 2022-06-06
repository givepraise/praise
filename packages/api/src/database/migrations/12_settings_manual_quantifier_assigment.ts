import { SettingGroup } from '../../settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    value: false,
    type: 'Boolean',
    label: 'Assign praise to all quantifiers',
    description:
      'Assign praise to all quantifiers, as evenly as possible. Enabling this setting will override the setting "Quantifiers Per Praise", as praise will be evenly split among all quantifiers.',
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
