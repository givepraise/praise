import { Types } from 'mongoose';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { generateUserAccountNameRealized } from '@useraccount/utils';
import { NotFoundError } from '@/error/errors';
import { shortenEthAddress } from './core';
import { UserDocument } from '../types';

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
    return shortenEthAddress(user.ethereumAddress);

  const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
  if (discordAccount) return generateUserAccountNameRealized(discordAccount);

  return generateUserAccountNameRealized(accounts[0]);
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
