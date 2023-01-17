import { SettingGroup } from '../../settings/enums/settings-group.enum';
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
