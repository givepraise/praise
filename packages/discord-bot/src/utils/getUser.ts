import { GuildMember } from 'discord.js';
import { User } from './api-schema';
import { apiClient } from './api';

/**
 * Fetch UserAccount associated with Discord user from api
 *
 * @param {string} id
 * @returns {Promise<User>}
 */
export const getUser = async (id: string): Promise<User | null> => {
  const user: User = await apiClient
    .get(`/users?id=${id}`)
    .then((res) => res.data.catch(null));

  return user;
};
