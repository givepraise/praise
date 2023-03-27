import { SettingModel } from '../schemas/settings/23_settings.schema';

const settings = [
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ User does not have required roles**\nThe praise command can only be used by members with the following roles: {@roles}. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
    defaultValue:
      '**❌ User does not have required roles**\nThe praise command can only be used by members with the following roles: {@roles}. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: {
        $set: { ...s },
      },
      upsert: true,
    },
  }));

  SettingModel.bulkWrite(settingUpdates);
};

const down = (): Promise<void> => Promise.resolve();

export { up, down };
