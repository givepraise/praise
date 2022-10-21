import { PraiseModel } from '@/praise/entities';
import { UserModel } from '@/user/entities';

const up = async (): Promise<void> => {
  const users = await UserModel.find();

  if (users.length === 0) return;

  const updates = await Promise.all(
    users.map((s) => ({
      updateOne: {
        filter: { _id: s._id },
        update: {
          $set: {
            rewardsEthAddress: 's.ethereumAddress',
            identityEthAddress: 's.ethereumAddress',
          },
          $unset: { ethereumAddress: 1 },
        },
      },
    }))
  );

  await UserModel.bulkWrite(updates);
};

const down = async (): Promise<void> => {
  await PraiseModel.updateMany(
    {
      rewardsEthAddress: { $exists: true },
      identityEthAddress: { $exists: true },
    },
    {
      $unset: { rewardsEthAddress: 1, identityEthAddress: 1 },
    }
  );
};

export { up, down };
