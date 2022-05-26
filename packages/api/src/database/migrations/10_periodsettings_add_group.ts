import { PeriodSettingsModel } from '@periodsettings/entities';
import { SettingGroup } from '@settings/types';

const up = async (): Promise<void> => {
  await PeriodSettingsModel.updateMany(
    {},
    { $set: { group: SettingGroup.PERIOD_DEFAULT } }
  );
};

const down = async (): Promise<void> => {
  await PeriodSettingsModel.updateMany({}, { $unset: { group: 1 } });
};

export { up, down };
