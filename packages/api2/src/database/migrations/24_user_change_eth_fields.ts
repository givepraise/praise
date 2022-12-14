import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import mongoose, { Types } from 'mongoose';
import { PraiseModel } from '../schemas/praise/22_praise.schema';
import { UserModel } from '../schemas/user/user.schema';
import { UserAccountModel } from '../schemas/useraccount/useraccount.schema';

/**
 * Generate username from user account name
 * If username is already taken than create one with discriminator
 *
 * @param userAccount
 * @returns {Promise<string>}
 */
const generateUserNameFromAccount = async (
  userAccount: UserAccount,
): Promise<string | null> => {
  let username;
  if (userAccount.platform === 'DISCORD' && userAccount.name.indexOf('#') > 0) {
    username = userAccount.name.split('#')[0];
  } else {
    username = userAccount.name;
  }

  const exists = await UserModel.find({ username }).lean();
  if (exists.length === 0) return username;
  if (userAccount.platform === 'DISCORD') return userAccount.name;
  return null;
};

const generateUserName = async (user: any): Promise<string> => {
  const accounts = (await UserAccountModel.find({
    user: new Types.ObjectId(user._id),
  })) as UserAccount[];

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

  const delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

  // Check if the index exists
  const indexExists = await UserModel.collection.indexExists(
    'ethereumAddress_1',
  );

  if (indexExists) {
    // Wait for the index to be ready
    await delay(10000);
    // The index is ready to be used, so we can drop it
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
    })),
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
    },
  );
};

export { up, down };
