import { UserAccountModel } from '@useraccount/entities';
import { UserDocument } from './types';

export const shortenEthAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

export const generateUserName = async (user: UserDocument): Promise<string> => {
  let username = '';

  const accounts = await UserAccountModel.find({ user: user._id });

  if (!accounts || accounts.length === 0) {
    username = shortenEthAddress(user.ethereumAddress);
  } else {
    const discordAccount = accounts.find((a) => a.platform === 'DISCORD');

    if (discordAccount) {
      username = discordAccount.name;
    } else {
      username = accounts[0].name;
    }
  }

  return username;
};
