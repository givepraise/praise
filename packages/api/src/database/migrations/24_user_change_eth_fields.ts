import { PraiseModel } from '@/praise/entities';
import { UserModel } from '@/user/entities';
import { shortenEthAddress } from '@/user/utils/core';
import { generateUserNameFromAccount } from '@/user/utils/entity';
import { UserAccountModel } from '@/useraccount/entities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateUserName = async (user: any): Promise<string> => {
  const accounts = await UserAccountModel.find({ user: user._id });
  if (!accounts || accounts.length === 0) {
    return shortenEthAddress(user.ethereumAddress);
  }

  const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
  if (discordAccount) return generateUserNameFromAccount(discordAccount);

  return generateUserNameFromAccount(accounts[0]);
};

const up = async (): Promise<void> => {
  const users = await UserModel.find().lean();

  if (users.length === 0) return;

  const indexes = await UserModel.collection.indexes();
  const indexExists = indexes.some(
    (index) => index.name === 'ethereumAddress_1'
  );
  if (indexExists) {
    await UserModel.collection.dropIndex('ethereumAddress_1');
  }

  const updates = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    users.map(async (u: any) => ({
      updateOne: {
        filter: { _id: u._id },
        update: {
          $set: {
            rewardsEthAddress: u.ethereumAddress,
            identityEthAddress: u.ethereumAddress,
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
