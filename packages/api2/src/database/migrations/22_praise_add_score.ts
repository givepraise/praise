import { model } from 'mongoose';
import { PraiseSchema } from '../schemas/praise/12_praise.schema';

const up = async (): Promise<void> => {
  const PraiseModel = model('Praise', PraiseSchema);
  const praises = await PraiseModel.find({
    scoreRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const updates = (await Promise.all(
    praises.map(async (s: any) => ({
      updateOne: {
        filter: { _id: s._id },
        update: {
          $set: {
            scoreRealized: await calculateQuantificationsCompositeScore(
              s.quantifications,
            ),
          },
        },
      },
    })),
  )) as any;

  await PraiseModel.bulkWrite(updates);
};

const down = async (): Promise<void> => {
  const PraiseModel = model('Praise', PraiseSchema);
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
