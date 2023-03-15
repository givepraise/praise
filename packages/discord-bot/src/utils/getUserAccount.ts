import { User } from 'discord.js';
import { UserAccount } from './api-schema';
import { apiClient } from './api';

const createUserAccount = async (
  user: User,
  guildId: string
): Promise<UserAccount[]> => {
  await apiClient.post(
    `/useraccounts`,
    {
      accountId: user.id,
      name: user.username + '#' + user.discriminator,
      avatarId: user.avatar || '',
      platform: 'DISCORD',
    },
    {
      headers: { 'x-discord-guild-id': guildId },
    }
  );
  const response = await apiClient.get<UserAccount[]>(
    `/useraccounts/?accountId=${user.id}`,
    {
      headers: { 'x-discord-guild-id': guildId },
    }
  );
  return response.data.filter((acc) => acc.platform === 'DISCORD');
};

const updateUserAccount = async (
  ua: UserAccount,
  user: User,
  guildId: string
): Promise<UserAccount[]> => {
  if (
    ua.name != user.username + '#' + user.discriminator ||
    ua.avatarId != user.avatar
  ) {
    ua.name = user.username + '#' + user.discriminator;
    ua.avatarId = user?.avatar || '';

    await apiClient.patch<UserAccount>(`/useraccounts/${ua._id}`, ua, {
      headers: { 'x-discord-guild-id': guildId },
    });

    return [
      (
        await apiClient.get<UserAccount>(`/useraccounts/${ua._id}`, {
          headers: { 'x-discord-guild-id': guildId },
        })
      ).data,
    ];
  }

  return [ua];
};

/**
 * Fetch UserAccount associated with Discord user from api
 *
 * @param {GuildMember} member
 * @returns {Promise<UserAccount>}
 */
export const getUserAccount = async (
  user: User,
  guildId: string
): Promise<UserAccount> => {
  const response = await apiClient.get<UserAccount[]>(
    `/useraccounts/?accountId=${user.id}`,
    {
      headers: { 'x-discord-guild-id': guildId },
    }
  );
  let data = response.data.filter((acc) => acc.platform === 'DISCORD');

  if (!data.length) {
    data = await createUserAccount(user, guildId);
  } else {
    data = await updateUserAccount(data[0], user, guildId);
  }
  return data[0];
};
