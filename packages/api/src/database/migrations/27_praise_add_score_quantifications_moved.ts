import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PeriodModel } from '../schemas/period/period.schema';
import { PeriodSettingsModel } from '../schemas/periodsettings/23_periodsettings.schema';
import { PraiseModel } from '../schemas/praise/27_praise_schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  enum SettingGroup {
    APPLICATION,
    PERIOD_DEFAULT,
    DISCORD,
    REWARDS,
  }

  const allPeriods = await PeriodModel.find();

  await PeriodSettingsModel.deleteMany({ group: SettingGroup.PERIOD_DEFAULT });
  for await (const period of allPeriods) {
    const periodSettingsDefaults = await context.settingsService.findByGroup(
      SettingGroup.PERIOD_DEFAULT,
    );

    const periodSettings = periodSettingsDefaults.map((setting) => {
      return {
        key: setting.key,
        period: period._id,
        setting: setting._id,
        value: setting.value,
        group: setting.group,
        periodOverridable: true,
        label: setting.label,
        type: setting.type,
      };
    });

    PeriodSettingsModel.insertMany(periodSettings);
  }

  const praises = await PraiseModel.find({
    score: { $exists: false },
  });

  if (praises.length === 0) return;

  const updates = await Promise.all(
    praises.map(async (p: any) => {
      return {
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              score:
                await context.quantificationsService.calculateQuantificationsCompositeScore(
                  p,
                ),
            },
          },
          upsert: true,
        },
      };
    }) as any,
  );

  await PraiseModel.bulkWrite(updates);
};

const down = async (): Promise<void> => {
  await PraiseModel.updateMany(
    {
      scoreRealized: { $exists: true },
    },
    {
      $unset: { scoreRealized: 1 },
    },
  );
};

export { up, down };
