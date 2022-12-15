import { PraiseModel } from '../schemas/praise/22_praise.schema';

const up = async (): Promise<void> => {
  await PraiseModel.updateMany(
    {
      quantifications: { $exists: true },
    },
    {
      $unset: { quantifications: 1 },
    },
  );
};

export { up };
