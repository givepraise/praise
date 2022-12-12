import { PraiseModel } from '../schemas/praise/12_praise.schema';

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
