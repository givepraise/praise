import mongoose, { Types } from 'mongoose';
import { PraiseModel } from '@/praise/entities';
import { UserModel } from '@/user/entities';
import { generateUserNameFromAccount } from '@/user/utils/entity';
import { UserAccountModel } from '@/useraccount/entities';
import { UserDocument } from '@/user/types';

export const generateUserName = async (user: UserDocument): Promise<string> => {
  const accounts = await UserAccountModel.find({
    user: new Types.ObjectId(user._id),
  });

  if (accounts && accounts.length > 0) {
    const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
    if (discordAccount) {
      const username = await generateUserNameFromAccount(discordAccount);
      if (username) return username;
    } else {
      const username = await generateUserNameFromAccount(accounts[0]);
      if (username) return username;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (user as any).ethereumAddress;
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
        filter: { _id: new Types.ObjectId(u._id) },
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

  await mongoose.connection.db.collection('users').bulkWrite(updates);
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
