import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PeriodSettingsModel } from '../schemas/periodsettings/23_periodsettings.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  // Check if the index exists
  const indexExists = await PeriodSettingsModel.collection.indexExists(
    'key_1_period_1',
  );

  if (indexExists) {
    await PeriodSettingsModel.collection.dropIndex('key_1_period_1');
  }

  // invoke previous model with all keys to delete them
  await PeriodSettingsModel.updateMany(
    {},
    {
      $unset: {
        key: 1,
        defaultValue: 1,
        label: 1,
        description: 1,
        group: 1,
        options: 1,
        subgroup: 1,
        periodOverridable: 1,
      },
    },
  );
};

export { up };
