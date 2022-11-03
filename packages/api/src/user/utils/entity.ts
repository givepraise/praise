import { Types } from 'mongoose';
import { NotFoundError } from '@/error/errors';
import { UserAccountDocument } from '@/useraccount/types';
import { UserAccountModel } from '@/useraccount/entities';
import { UserModel } from '@/user/entities';
import { shortenEthAddress } from './core';
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
): Promise<string> => {
  const shortUsername = userAccount.name.split('#')[0];
  const userWithSaneExistingUsername = await UserModel.find({
    username: shortUsername,
  }).lean();

  if (userAccount.platform === 'DISCORD' && !userWithSaneExistingUsername)
    return userAccount.name.split('#')[0];

  return userAccount.name;
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
  const accounts = await UserAccountModel.find({ user: user._id });
  if (!accounts || accounts.length === 0)
    return shortenEthAddress(user.identityEthAddress);

  const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
  if (discordAccount) return generateUserNameFromAccount(discordAccount);

  return generateUserNameFromAccount(accounts[0]);
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
