import { SettingGroup } from '../../settings/enums/setting-group.enum';
import { SettingModel } from '../schemas/settings/23_settings.schema';

const settings = [
  {
    key: 'DISCORD_BOT_DIRECT_PRAISE_QUANTIFICATION_ENABLED',
    value: false,
    defaultValue: false,
    type: 'Boolean',
    periodOverridable: false,
    label: 'Direct praise quantification',
    description:
      'Enabling this will allow the praise giver to quantify their praise directly at the time of praising. Enabling this will disable and bypass the regular praise quantification flow.',
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
