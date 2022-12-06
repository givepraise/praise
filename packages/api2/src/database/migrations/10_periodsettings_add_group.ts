import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { PeriodSettingsSchema } from '../schemas/periodsettings/periodsettings.schema';

const up = async (): Promise<void> => {
  const PeriodSettingModel = model('Setting', PeriodSettingsSchema);
  await PeriodSettingModel.updateMany(
    {},
    { $set: { group: SettingGroup.PERIOD_DEFAULT } },
  );
};

const down = async (): Promise<void> => {
  const PeriodSettingModel = model('Setting', PeriodSettingsSchema);
  await PeriodSettingModel.updateMany({}, { $unset: { group: 1 } });
};

export { up, down };
