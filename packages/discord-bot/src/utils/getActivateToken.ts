import { UserAccount, UserAccountWithActivateToken } from './api-schema';
import { apiClient } from './api';
import { randomBytes } from 'crypto';

/**
 * Fetch activateToken associated with userAccount from api
 *
 * @param {UserAccount} userAccount
 * @returns {Promise<string>}
 */
export const getActivateToken = async (
  userAccount: UserAccount,
  host: string
): Promise<string | undefined> => {
  const ua = {
    activateToken: randomBytes(10).toString('hex'),
  };

  const response = await apiClient
    .patch<typeof ua>(`/useraccounts/${userAccount._id}`, ua, {
      headers: { host: host },
    })
    .then((res) => res.data)
    .catch((e) => {
      console.log(e.message);
      return undefined;
    });

  return response?.activateToken;
};
