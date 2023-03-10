import { GuildMember } from 'discord.js';
import { UserAccount } from './api-schema';
import { apiClient } from './api';

/**
 * Fetch UserAccount associated with Discord user from api
 *
 * @param {GuildMember} member
 * @returns {Promise<UserAccount>}
 */
export const getUserAccount = async (
  member: GuildMember
): Promise<UserAccount> => {
  const userAccount: UserAccount = await apiClient
    .get(`/useraccounts?accountId=${member.user.id}`)
    .then(async (res) => {
      const data = res.data;
      if (
        data.name != member.user.username + '#' + member.user.discriminator ||
        data.avatarId != member.user.avatar
      ) {
        data.name = member.user.username + '#' + member.user.discriminator;
        data.avatarId = member.user.avatar;

        await apiClient.patch(
          `/useraccounts?accountId=${member.user.id}`,
          data
        );
      }
      return res.data;
    })
    .catch(async () => {
      return await apiClient
        .post(`/useraccounts`, {
          accountId: member.user.id,
          name: member.user.username + '#' + member.user.discriminator,
          avatarId: member.user.avatar,
          platform: 'DISCORD',
        })
        .then((res) => res.data);
    });

  return userAccount;
};
