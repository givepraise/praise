import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PeriodSettingsModel } from '../schemas/periodsettings/23_periodsettings.schema';
import { SettingModel } from '../schemas/settings/23_settings.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  // Check if the index exists
  const indexExists = await PeriodSettingsModel.collection.indexExists(
    'key_1_period_1',
  );

  if (indexExists) {
    await PeriodSettingsModel.collection.dropIndex('key_1_period_1');
  }

  const periodSettings = await PeriodSettingsModel.find({});

  if (periodSettings.length === 0) return;

  const updates = await Promise.all(
    periodSettings.map(async (periodSetting: any) => {
      return {
        updateOne: {
          filter: { _id: periodSetting._id },
          update: {
            $set: {
              setting: (
                await context.settingsService.findOneByKey(periodSetting.key)
              )?._id
            },
            $unset: {
              key: 1,
              defaultValue: 1,
              label: 1,
              description: 1,
              group: 1,
              options: 1,
              subgroup: 1,
              periodOverridable: 1,
              type: 1,
            },
          },
          upsert: true,
        },
      }
    }) as any,
  );

  await PeriodSettingsModel.bulkWrite(updates);
};

export { up };
