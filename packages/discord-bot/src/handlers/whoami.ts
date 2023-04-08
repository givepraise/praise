import { ChatInputCommandInteraction, Guild, GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/embeds/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { dmError } from '../utils/embeds/praiseEmbeds';
import { getUser } from '../utils/getUser';
import { UserAccount } from '../utils/api-schema';
import { apiClient } from '../utils/api';
import { CommandHandler } from 'src/interfaces/CommandHandler';

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
    await interaction.editReply(await dmError());
    return;
  }

  const ua = await getUserAccount((member as GuildMember).user, guild.id);

  const state: UserState = {
    id: ua.accountId,
    username: ua.name,
    hasPraiseGiverRole: false,
    activated: !ua.user ? false : true,
  };

  state.hasPraiseGiverRole = await assertPraiseGiver(
    member as GuildMember,
    interaction,
    false
  );

  const user =
    ua.user == null
      ? undefined
      : await getUser(
          typeof ua.user === 'string' ? ua.user : ua.user._id,
          guild.id
        );

  state.praiseRoles = user?.roles || undefined;
  state.address = user?.identityEthAddress || '';
  state.avatar = ua.avatarId;
  state.activations = [];

  if (ua.user != null) {
    const activatedAccounts = await apiClient
      .get<UserAccount[]>(
        `useraccounts?user=${
          typeof ua.user === 'string' ? ua.user : ua.user._id
        }`,
        {
          headers: { host: guild.id },
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
