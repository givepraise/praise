import { GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/embeds/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { renderMessage } from '../utils/renderMessage';
import { UserAccount } from '../utils/api-schema';
import { apiClient } from '../utils/api';
import { CommandHandler } from '../interfaces/CommandHandler';
import { logger } from '../utils/logger';

/**
 * Execute command /whoami
 * Gives the user information about their account and activation status
 *
 */
export const whoamiHandler: CommandHandler = async (
  client,
  interaction,
  host
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  try {
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

    if (ua.user !== undefined) {
      state.praiseRoles = [...ua.user.roles];
      state.address = ua.user.identityEthAddress || '';
      state.avatar = ua.avatarId;
      state.activations = [];

      const activatedAccounts = await apiClient
        .get<UserAccount[]>(`useraccounts?user=${ua.user._id}`, {
          headers: { host },
        })
        .then((res) => res.data);
      for (const account of activatedAccounts) {
        state.activations.push({
          platform: account.platform,
          user: account.name,
          activationDate: account.createdAt,
        });
      }
    } else {
      if (state.activations) {
        state.activations.push({
          platform: 'DISCORD',
          user: ua.name,
          activationDate: ua.createdAt,
        });
      }
    }

    await interaction.editReply({
      embeds: [getStateEmbed(state)],
    });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(`(whoami) ${(err as any).message as string}`);
    throw err;
  }
};
