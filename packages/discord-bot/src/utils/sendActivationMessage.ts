import {
  ChatInputCommandInteraction,
  GuildMember,
  APIInteractionGuildMember,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
} from 'discord.js';
import { getUserAccount } from '../utils/getUserAccount';
import { getActivateToken } from '../utils/getActivateToken';
import { renderMessage } from '../utils/renderMessage';

export const sendActivationMessage = async (
  interaction: ChatInputCommandInteraction,
  host: string,
  member: GuildMember | APIInteractionGuildMember,
  retry: boolean = false
): Promise<Message | undefined> => {
  try {
    const userAccount = await getUserAccount(
      (member as GuildMember).user,
      host
    );
    if (userAccount.user && userAccount.user !== null) {
      await interaction.editReply({
        content: await renderMessage(
          'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
          host
        ),
      });
      return;
    }

    const activateToken = await getActivateToken(userAccount, host);

    if (!activateToken) {
      await interaction.editReply({
        content: 'Unable to activate user account.',
      });
      return;
    }

    const hostUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.FRONTEND_URL
        : `https://${host}`;

    const activationURL = `${hostUrl || 'undefined:/'}/activate?accountId=${
      member.user.id
    }&platform=DISCORD&token=${activateToken}`;

    const activateButton = new ButtonBuilder()
      .setLabel('Activate')
      .setURL(activationURL)
      .setStyle(ButtonStyle.Link);
    const retryButton = new ButtonBuilder()
      .setCustomId('retry')
      .setLabel('Retry')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      activateButton
    );
    if (retry) row.addComponents(retryButton);

    const response = await interaction.editReply({
      content: `In order to dish praise, you need to activate your account by following this link and signing a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
      components: [row],
    });
    return response;
  } catch (error) {
    await interaction.editReply({
      content: 'Unable to activate user account.',
    });
  }
};
