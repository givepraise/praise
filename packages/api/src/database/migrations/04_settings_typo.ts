import { PeriodSettingsModel } from '../schemas/periodsettings/03_periodsettings.schema';
import { SettingModel } from '../schemas/settings/03_settings.schema';

const original = {
  key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
  label: 'Use Psuedonyms',
  description:
    'Should praise reciever names be obscured by a random psuedonym?',
};

const fixed = {
  label: 'Use Pseudonyms',
  description:
    'Should praise reciever names be obscured by a random pseudonym?',
};

const up = async (): Promise<void> => {
  await SettingModel.updateOne(
    { key: original.key },
    { $set: { label: fixed.label, description: fixed.description } },
  );

  await PeriodSettingsModel.updateMany(
    { key: original.key },
    { $set: { label: fixed.label, description: fixed.description } },
  );
};

const down = async (): Promise<void> => {
  await SettingModel.updateOne(
    { key: original.key },
    {
      $set: {
        label: original.label,
        description: original.description,
      },
    },
  );

  await PeriodSettingsModel.updateMany(
    { key: original.key },
    {
      $set: {
        label: original.label,
        description: original.description,
      },
    },
  );
};

export { up, down };
