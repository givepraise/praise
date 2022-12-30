import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PraiseModel } from '../schemas/praise/27_praise_schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
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
