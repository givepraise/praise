import { Praise } from '@/praise/schemas/praise.schema';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { User } from '@/users/schemas/users.schema';
import mongoose, { model, Types } from 'mongoose';
import { PraiseSchema } from '../schemas/praise/praise.schema';
import { UserSchema } from '../schemas/user/user.schema';
import { userAccountSchema } from '../schemas/useraccount/useraccount.schema';

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
  const UserModel = model<User>('User', UserSchema);
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

const generateUserName = async (user: User): Promise<string> => {
  const UserAccountModel = model<UserAccount>('UserAccount', userAccountSchema);
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
  const UserModel = model<User>('User', UserSchema);
  const users = await UserModel.find().lean();

  if (users.length === 0) return;

  const indexes = await UserModel.collection.indexes();
  const indexExists = indexes.some(
    (index: any) => index.name === 'ethereumAddress_1',
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
    })),
  );

  await mongoose.connection.db.collection('users').bulkWrite(updates);
};

const down = async (): Promise<void> => {
  const PraiseModel = model<Praise>('Praise', PraiseSchema);

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
