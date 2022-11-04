import { Types } from 'mongoose';
import { NotFoundError } from '@/error/errors';
import { UserAccountDocument } from '@/useraccount/types';
import { UserAccountModel } from '@/useraccount/entities';
import { UserModel } from '@/user/entities';
import { UserDocument } from '../types';

/**
 * Generate username from user account name
 * If username is already taken than create one with discriminator
 *
 * @param userAccount
 * @returns {Promise<string>}
 */
export const generateUserNameFromAccount = async (
  userAccount: UserAccountDocument
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

/**
 * Generate a display name for a given User,
 *  either by an associated UserAccount name,
 *  or by ethereum address shortened
 *
 * @param {UserDocument} user
 * @returns {Promise<string>}
 */
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

  return user.identityEthAddress;
};

/**
 * Fetch a user with a list of their associated user accounts
 *
 * @param {string} id
 * @returns {Promise<UserDocument>}
 */
export const findUser = async (id: string): Promise<UserDocument> => {
  const users: UserDocument[] = await UserModel.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
  ]);
  if (!Array.isArray(users) || users.length === 0)
    throw new NotFoundError('User');
  return users[0];
};
