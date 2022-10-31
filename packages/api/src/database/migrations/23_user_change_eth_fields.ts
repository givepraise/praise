import { PraiseModel } from '@/praise/entities';
import { UserModel } from '@/user/entities';
import { generateUserName } from '@/user/utils/entity';

const up = async (): Promise<void> => {
  const users = await UserModel.find();

  if (users.length === 0) return;

  await UserModel.collection.dropIndex('ethereumAddress');

  const updates = await Promise.all(
    users.map(async (u) => ({
      updateOne: {
        filter: { _id: u._id },
        update: {
          $set: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rewardsEthAddress: (u as any).ethereumAddress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            identityEthAddress: (u as any).ethereumAddress,
            username: await generateUserName(u),
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
      username: { $exists: true },
    },
    {
      $unset: { rewardsEthAddress: 1, identityEthAddress: 1, username: 1 },
    }
  );
};

export { up, down };
