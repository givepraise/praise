import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PraiseModel } from '../schemas/praise/12_praise.schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  const praises = await PraiseModel.find({
    scoreRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const updates = await Promise.all(
    praises.map(async (p: any) => ({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            scoreRealized:
              await context.quantificationsService.calculateQuantificationsCompositeScore(
                p.quantifications,
              ),
          },
        },
        upsert: true,
      },
    })) as any,
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
