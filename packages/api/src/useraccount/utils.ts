import { UserAccountDocument } from './types';

export const generateUserAccountNameRealized = (
  userAccount: UserAccountDocument
): string => {
  if (userAccount.platform === 'DISCORD') return userAccount.name.split('#')[0];
  return userAccount.name;
};
