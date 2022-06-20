import { UserAccountModel } from '@useraccount/entities';
import { generateUserAccountNameRealized } from '@useraccount/utils';
import { UserDocument } from './types';

export const shortenEthAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export const generateUserName = async (user: UserDocument): Promise<string> => {
  const accounts = await UserAccountModel.find({ user: user._id });
  if (!accounts || accounts.length === 0)
    return shortenEthAddress(user.ethereumAddress);

  const discordAccount = accounts.find((a) => a.platform === 'DISCORD');
  if (discordAccount) return generateUserAccountNameRealized(discordAccount);

  return generateUserAccountNameRealized(accounts[0]);
};
