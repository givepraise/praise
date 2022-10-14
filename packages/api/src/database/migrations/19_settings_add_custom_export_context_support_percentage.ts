import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'CUSTOM_EXPORT_MAP',
    value:
      'https://raw.githubusercontent.com/commons-stack/praise-export-transformers/main/aragon-fixed-budget/transformer.json',
    type: 'String',
    label: 'Transformation map',
    description:
      'The transformation map describes the transform to be performed. See documentation for details on how to create a transformation map.',
    group: SettingGroup.CUSTOM_EXPORT,
  },
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
    value: '{ "budget": 100, "token": "TOKEN_NAME" } ',
    type: 'JSON',
    label: 'Export context',
    description:
      'Default values for the export context used by the transformation map.',
    group: SettingGroup.CUSTOM_EXPORT,
  },
  {
    key: 'CUSTOM_EXPORT_FORMAT',
    value: 'csv',
    type: 'Radio',
    label: 'Export format',
    description: '',
    options: '["csv", "json"]',
    group: SettingGroup.CUSTOM_EXPORT,
  },
  {
    key: 'CS_SUPPORT_PERCENTAGE',
    value: 2,
    type: 'Integer',
    label: 'Praise development support percentage',
    description:
      'Support the development of Praise, consider donating a percentage of the distribution to the development team.',
    group: SettingGroup.CUSTOM_EXPORT,
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
