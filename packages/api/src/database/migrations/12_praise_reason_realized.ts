import { PraiseModel } from '@/praise/entities';

const up = async (): Promise<void> => {
  const praises = await PraiseModel.find({
    reasonRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const updates = praises.map((s) => ({
    updateOne: {
      filter: { _id: s._id },
      update: { $set: { reasonRealized: s.reason } },
    },
  }));

  await PraiseModel.bulkWrite(updates);
};

const down = async (): Promise<void> => {
  await PraiseModel.updateMany(
    {
      reasonRealized: { $exists: true },
    },
    {
      $unset: { reasonRealized: 1 },
    }
  );
};

export { up, down };
