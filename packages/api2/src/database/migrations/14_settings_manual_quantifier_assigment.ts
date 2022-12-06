import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { PeriodSchema } from '../schemas/period/period.schema';
import { PeriodSettingsSchema } from '../schemas/periodsettings/periodsettings.schema';
import { SettingSchema } from '../schemas/settings/07_settings.schema';

const newSetting = {
  key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
  value: false,
  type: 'Boolean',
  label: 'Assign praise to all quantifiers',
  description:
    'Evenly assign praise among all quantifiers. If enabled, the setting "Praise per Quantifer" will be ignored',
  group: SettingGroup.PERIOD_DEFAULT,
};

const up = async (): Promise<void> => {
  const SettingModel = model('Setting', SettingSchema);
  const PeriodSettingModel = model('PeriodSetting', PeriodSettingsSchema);
  const PeriodModel = model('Period', PeriodSchema);

  await SettingModel.create(newSetting);

  const periods = await PeriodModel.find({});
  const periodsettings = periods.map((p: any) => ({
    ...newSetting,
    period: p._id,
  }));

  await PeriodSettingModel.insertMany(periodsettings);
};

const down = async (): Promise<void> => {
  const SettingModel = model('Setting', SettingSchema);
  const PeriodSettingModel = model('PeriodSetting', PeriodSettingsSchema);

  await SettingModel.deleteMany({ key: newSetting.key });
  await PeriodSettingModel.deleteMany({ key: newSetting.key });
};

export { up, down };
