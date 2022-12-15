import { SettingGroup } from '../../settings/interfaces/settings-group.interface';
import { PeriodSettingsModel } from '../schemas/periodsettings/07_periodsettings.schema';

const up = async (): Promise<void> => {
  await PeriodSettingsModel.updateMany(
    {},
    { $set: { group: SettingGroup.PERIOD_DEFAULT } },
  );
};

const down = async (): Promise<void> => {
  await PeriodSettingsModel.updateMany({}, { $unset: { group: 1 } });
};

export { up, down };
