import { apiClient } from './api';
import { User } from './api-schema';

/**
 * Fetch User by id
 *
 * @param {string} id
 * @returns {Promise<User>}
 */
export const getUser = async (
  id: string,
  guildId: string
): Promise<User | undefined> => {
  return await apiClient
    .get<User>(`/users/${id}`, {
      headers: { 'x-discord-guild-id': guildId },
    })
    .then((res) => res.data)
    .catch(() => undefined);
};
