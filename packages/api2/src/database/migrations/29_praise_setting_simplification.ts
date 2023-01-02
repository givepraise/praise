import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PeriodSettingsModel } from '../schemas/periodsettings/29_periodsettings.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  const periodSettings = await PeriodSettingsModel.find();

  if (periodSettings.length === 0) return;

  const updates = await Promise.all(
    periodSettings.map(async (p: any) => ({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $unset: {
            key: 1,
            defaultValue: 1,
            type: 1,
            label: 1,
            description: 1,
            group: 1,
            options: 1,
            subgroup: 1,
            periodOverridable: 1
          },
        },
        upsert: true,
      },
    })) as any,
  );

  await PeriodSettingsModel.bulkWrite(updates);
};

export { up };
