import { PraiseModel } from '@/praise/entities';
import { calculateQuantificationsCompositeScore } from '../../praise/utils/score';

const up = async (): Promise<void> => {
  const praises = await PraiseModel.find({
    scoreRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const updates = await Promise.all(
    praises.map(async (s) => ({
      updateOne: {
        filter: { _id: s._id },
        update: {
          $set: {
            scoreRealized: await calculateQuantificationsCompositeScore(
              s.quantifications
            ),
          },
        },
      },
    }))
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
    }
  );
};

export { up, down };
