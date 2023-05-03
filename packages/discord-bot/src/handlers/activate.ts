import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';
import { GuildMember } from 'discord.js';
import { getActivateToken } from '../utils/getActivateToken';
import { renderMessage } from '../utils/renderMessage';

/**
 * Executes command /activate
 *  Creates a one-time link on the Praise frontend linking to the activate page
 *  where the user can associate their Discord user with a UserAccount
 *
 */
export const activationHandler: CommandHandler = async (
  client,
  interaction,
  host
) => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  try {
    const userAccount = await getUserAccount(
      (member as GuildMember).user,
      host
    );
    if (userAccount.user && userAccount.user !== null) {
      await interaction.reply({
        content: await renderMessage(
          'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
          host
        ),
        ephemeral: true,
      });
      return;
    }

    const activateToken = await getActivateToken(userAccount, host);

    if (!activateToken) {
      await interaction.reply({
        content: 'Unable to activate user account.',
        ephemeral: true,
      });
      return;
    }

    const hostUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.FRONTEND_URL
        : `https://${(await client.hostCache.get(guild.id)) as string}`;

    const activationURL = `${hostUrl || 'undefined:/'}/activate?accountId=${
      member.user.id
    }&platform=DISCORD&token=${activateToken}`;

    await interaction.reply({
      content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: 'Unable to activate user account.',
      ephemeral: true,
    });
  }
};
