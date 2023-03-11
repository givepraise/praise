import { GuildMember, User } from 'discord.js';
import { UserAccount } from './api-schema';
import { apiClient } from './api';

const createUserAccount = async (user: User): Promise<UserAccount[]> => {
  await apiClient.post(`/useraccounts`, {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    avatarId: user.avatar || '',
    platform: 'DISCORD',
  });
  const response = await apiClient.get<UserAccount[]>(
    `/useraccounts/?accountId=${user.id}`
  );
  return response.data.filter((acc) => acc.platform === 'DISCORD');
};

const updateUserAccount = async (
  ua: UserAccount,
  user: User
): Promise<UserAccount[]> => {
  if (
    ua.name != user.username + '#' + user.discriminator ||
    ua.avatarId != user.avatar
  ) {
    ua.name = user.username + '#' + user.discriminator;
    ua.avatarId = user?.avatar || '';

    await apiClient.patch<UserAccount>(`/useraccounts/${ua._id}`, ua);

    return [(await apiClient.get<UserAccount>(`/useraccounts/${ua._id}`)).data];
  }

  return [ua];
};

/**
 * Fetch UserAccount associated with Discord user from api
 *
 * @param {GuildMember} member
 * @returns {Promise<UserAccount>}
 */
export const getUserAccount = async (user: User): Promise<UserAccount> => {
  const response = await apiClient.get<UserAccount[]>(
    `/useraccounts/?accountId=${user.id}`
  );
  let data = response.data.filter((acc) => acc.platform === 'DISCORD');

  if (data.length < 0) {
    data = await createUserAccount(user);
  } else {
    data = await updateUserAccount(data[0], user);
  }
  return data[0];
};
