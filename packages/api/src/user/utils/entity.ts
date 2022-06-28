import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { generateUserAccountNameRealized } from '@useraccount/utils';
import { NotFoundError } from '@error/errors';
import { Types } from 'mongoose';
import { UserDocument } from '../types';
import { shortenEthAddress } from './core';

export const generateUserName = async (user: UserDocument): Promise<string> => {
  const accounts = await UserAccountModel.find({ user: user._id });
  if (!accounts || accounts.length === 0)
    return shortenEthAddress(user.ethereumAddress);

  const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
  if (discordAccount) return generateUserAccountNameRealized(discordAccount);

  return generateUserAccountNameRealized(accounts[0]);
};

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
