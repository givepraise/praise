import { PeriodSettingsModel } from '@/periodsettings//entities';
import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '@/settings/entities';

const oldSetting = {
  key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
  value: false,
  type: 'Boolean',
  label: 'Assign praise to all quantifiers',
  description:
    'Evenly assign praise among all quantifiers. If enabled, the setting "Quantifiers Per Praise" will be ignored',
  group: SettingGroup.PERIOD_DEFAULT,
};

const newSetting = {
  key: 'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
  value: false,
  type: 'Boolean',
  label: 'Assign praise evenly among quantifiers',
  description:
    'Assign praise roughly evenly among all quantifiers (or as many as possible). If enabled, the setting "Quantifiers Per Praise" will be ignored',
  group: SettingGroup.PERIOD_DEFAULT,
};

const up = async (): Promise<void> => {
  await SettingsModel.updateMany({ key: oldSetting.key }, { $set: newSetting });
  await PeriodSettingsModel.updateMany(
    { key: oldSetting.key },
    { $set: newSetting }
  );
};

const down = async (): Promise<void> => {
  await SettingsModel.updateMany({ key: newSetting.key }, { $set: oldSetting });
  await PeriodSettingsModel.updateMany(
    { key: newSetting.key },
    { $set: oldSetting }
  );
};

export { up, down };
