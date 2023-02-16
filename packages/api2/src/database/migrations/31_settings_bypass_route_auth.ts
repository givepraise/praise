import { SettingGroup } from '../../settings/enums/setting-group.enum';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const settings = [
  {
    key: 'BYPASS_ROUTE_AUTH',
    defaultValue:
      '/api/periods/export,/api/users/export,/api/quantifications/export,/api/praise/export,/api/useraccounts/export',
    value:
      '/api/periods/export,/api/users/export,/api/quantifications/export,/api/praise/export,/api/useraccounts/export',
    type: 'StringList',
    label: 'Bypass Route Authentication',
    description: 'The routes listed here will not require authentication.',
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
  })) as any;

  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
