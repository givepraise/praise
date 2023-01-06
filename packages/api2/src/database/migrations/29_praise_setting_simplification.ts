import mongoose from 'mongoose';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PeriodSettingsModel } from '../schemas/periodsettings/23_periodsettings.schema';
import { PeriodSettingsSchema } from '../schemas/periodsettings/29_periodsettings.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
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
        periodOverridable: 1
      },
    }
  );

  // Delete previous model and add new one
  delete mongoose.models['PeriodSettings'];
  mongoose.model('PeriodSettings', PeriodSettingsSchema);
};

export { up };
