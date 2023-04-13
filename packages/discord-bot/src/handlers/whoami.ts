import { GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/embeds/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { renderMessage } from '../utils/embeds/praiseEmbeds';
import { getUser } from '../utils/getUser';
import { UserAccount } from '../utils/api-schema';
import { apiClient } from '../utils/api';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getHost } from '../utils/getHost';

/**
 * Execute command /whoami
 * Gives the user information about their account and activation status
 *
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
export const whoamiHandler: CommandHandler = async (
  client,
  interaction
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const host = await getHost(client, guild.id);

  if (host === undefined) {
    await interaction.editReply('This community is not registered for praise.');
    return;
  }

  const ua = await getUserAccount((member as GuildMember).user, host);

  const state: UserState = {
    id: ua.accountId,
    username: ua.name,
    hasPraiseGiverRole: false,
    activated: !ua.user ? false : true,
  };

  state.hasPraiseGiverRole = await assertPraiseGiver(
    member as GuildMember,
    interaction,
    false,
    host
  );

  const user =
    ua.user === null
      ? undefined
      : await getUser(
          typeof ua.user === 'string' ? ua.user : ua.user._id,
          guild.id
        );

  state.praiseRoles = user?.roles || undefined;
  state.address = user?.identityEthAddress || '';
  state.avatar = ua.avatarId;
  state.activations = [];

  if (ua.user !== null) {
    const activatedAccounts = await apiClient
      .get<UserAccount[]>(
        `useraccounts?user=${
          typeof ua.user === 'string' ? ua.user : ua.user._id
        }`,
        {
          headers: { host: host },
        }
      )
      .then((res) => res.data);
    for (const account of activatedAccounts) {
      state.activations.push({
        platform: account.platform,
        user: account.name,
        activationDate: account.createdAt,
        latestUsageDate: account.updatedAt,
      });
    }
  } else {
    state.activations.push({
      platform: 'DISCORD',
      user: ua.name,
      activationDate: ua.createdAt,
      latestUsageDate: ua.updatedAt,
    });
  }

  await interaction.editReply({
    embeds: [getStateEmbed(state)],
  });
};
