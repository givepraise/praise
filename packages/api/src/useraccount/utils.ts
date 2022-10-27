import { UserAccountDocument } from './types';

/**
 * Generate a display name from a UserAccount
 *
 * @param {UserAccountDocument} userAccount
 * @returns {string}
 */
export const generateUserAccountNameRealized = (
  userAccount: UserAccountDocument
): string => {
  if (userAccount.platform === 'DISCORD') return userAccount.name.split('#')[0];

  return userAccount.name;
};
