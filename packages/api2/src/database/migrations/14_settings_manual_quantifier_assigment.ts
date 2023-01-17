import { SettingGroup } from '../../settings/enums/settings-group.enum';
import { PeriodModel } from '../schemas/period/period.schema';
import { PeriodSettingsModel } from '../schemas/periodsettings/07_periodsettings.schema';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const newSetting = {
  key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
  value: false,
  type: 'Boolean',
  label: 'Assign praise to all quantifiers',
  description:
    'Evenly assign praise among all quantifiers. If enabled, the setting "Praise per Quantifer" will be ignored',
  group: SettingGroup.PERIOD_DEFAULT,
  periodOverridable: true,
};

const up = async (): Promise<void> => {
  await SettingModel.create(newSetting);

  const periods = await PeriodModel.find({});
  const periodsettings = periods.map((p: any) => ({
    ...newSetting,
    period: p._id,
  }));

  await PeriodSettingsModel.insertMany(periodsettings);
};

const down = async (): Promise<void> => {
  await SettingModel.deleteMany({ key: newSetting.key });
  await PeriodSettingsModel.deleteMany({ key: newSetting.key });
};

export { up, down };
