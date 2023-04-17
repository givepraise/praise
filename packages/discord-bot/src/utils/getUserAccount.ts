import { User } from 'discord.js';
import { UserAccount } from './api-schema';
import { apiClient } from './api';

const createUserAccount = async (
  user: User,
  host: string
): Promise<UserAccount[]> => {
  await apiClient
    .post(
      '/useraccounts',
      {
        accountId: user.id,
        name: user.username + '#' + user.discriminator,
        avatarId: user.avatar || '',
        platform: 'DISCORD',
      },
      {
        headers: { host: host },
      }
    )
    .catch((err) => console.log(err));
  const response = await apiClient.get<UserAccount[]>(
    `/useraccounts/?accountId=${user.id}`,
    {
      headers: { host: host },
    }
  );
  return response.data.filter((acc) => acc.platform === 'DISCORD');
};

const updateUserAccount = async (
  ua: UserAccount,
  user: User,
  host: string
): Promise<UserAccount[]> => {
  if (
    ua.name !== user.username + '#' + user.discriminator ||
    ua.avatarId !== user.avatar
  ) {
    ua.name = user.username + '#' + user.discriminator;
    ua.avatarId = user?.avatar || '';

    await apiClient.patch<UserAccount>(`/useraccounts/${ua._id}`, ua, {
      headers: { host: host },
    });

    return [
      (
        await apiClient.get<UserAccount>(`/useraccounts/${ua._id}`, {
          headers: { host: host },
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
  host: string
): Promise<UserAccount> => {
  let data = await apiClient
    .get<UserAccount[]>(`/useraccounts/?accountId=${user.id}`, {
      headers: { host: host },
    })
    .then((res) => res.data.filter((acc) => acc.platform === 'DISCORD'))
    .catch(() => undefined);

  if (!data || !data.length) {
    data = await createUserAccount(user, host);
  } else {
    data = await updateUserAccount(data[0], user, host);
  }

  return data[0];
};
