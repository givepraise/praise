import { UserAccount, UserAccountWithActivateToken } from './api-schema';
import { apiClient } from './api';

/**
 * Fetch activateToken associated with userAccount from api
 *
 * @param {UserAccount} userAccount
 * @returns {Promise<string>}
 */
export const getActivateToken = async (
  userAccount: UserAccount,
  guildId: string
): Promise<string> => {
  const response = await apiClient
    .get<UserAccountWithActivateToken>(`/useraccounts/${userAccount._id}`, {
      headers: { 'x-discord-guild-id': guildId },
    })
    .then((res) => res.data);
  return response.activateToken;
};
