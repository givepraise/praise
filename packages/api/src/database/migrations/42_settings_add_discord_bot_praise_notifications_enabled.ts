import { SettingGroup } from '../../settings/enums/setting-group.enum';
import { SettingModel } from '../schemas/settings/23_settings.schema';

const settings = [
  {
    key: 'DISCORD_BOT_PRAISE_NOTIFICATIONS_ENABLED',
    value: true,
    defaultValue: true,
    type: 'Boolean',
    periodOverridable: false,
    label: 'Praise notifications enabled',
    description:
      'Unchecking this will disable all bot notifications from the Discord bot to individual users when praising.',
    group: SettingGroup.DISCORD,
    subgroup: 1,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $setOnInsert: { ...s } }, // Insert setting if not found, otherwise continue
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
