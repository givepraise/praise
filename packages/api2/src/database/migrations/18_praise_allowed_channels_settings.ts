import { SettingGroup } from '../../settings/enums/settings-group.enum';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const settings = [
  {
    key: 'PRAISE_ALLOWED_IN_ALL_CHANNELS',
    value: true,
    type: 'Boolean',
    label: 'Praising allowed in all Channels',
    description:
      'If enabled, this allows praise to be dished in all channels in the server',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_ALLOWED_CHANNEL_IDS',
    value: '',
    type: 'StringList',
    label: 'Channels where praise is allowed',
    description:
      'Comma separated list of channel IDs in which praising is allowed',
    group: SettingGroup.DISCORD,
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
