import { Types } from 'mongoose';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { PraiseModel } from '../schemas/praise/27_praise_schema';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  const praises = await PraiseModel.find();

  if (praises.length === 0) return;

  const updates = await Promise.all(
    praises.map(async (p: any) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(p._id) },
        update: {
          $set: {
            reasonRaw: p.reason,
            reason: p.reasonRealized,
          },
          $unset: { reasonRealized: 1 },
        },
      },
    })) as any,
  );

  await PraiseModel.bulkWrite(updates);
};

export { up };
