import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
    value: '{}',
    type: 'Object',
    label: 'Custom export context',
    description: 'Custom export context',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'CS_SUPPORT_PERCENTAGE',
    value: 2,
    type: 'Integer',
    label: 'CS support percentage',
    description: 'Commons Stack support percentage',
    group: SettingGroup.APPLICATION,
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
