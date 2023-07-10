import {
  ChatInputCommandInteraction,
  GuildMember,
  APIInteractionGuildMember,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
  ButtonInteraction,
} from 'discord.js';
import { getUserAccount } from '../utils/getUserAccount';
import { getActivateToken } from '../utils/getActivateToken';
import { renderMessage } from '../utils/renderMessage';

export const sendActivationMessage = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  host: string,
  member: GuildMember | APIInteractionGuildMember,
  retry = false
): Promise<[Message, string] | undefined> => {
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

    const row = new ActionRowBuilder<ButtonBuilder>();

    if (retry) {
      row.addComponents(
        new ButtonBuilder()
          .setLabel('Activate')
          .setCustomId(`activate-${member.user.id}`)
          .setStyle(ButtonStyle.Primary)
      );
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('retry')
          .setLabel('Retry')
          .setStyle(ButtonStyle.Success)
      );
    } else {
      row.addComponents(
        new ButtonBuilder()
          .setLabel('Activate')
          .setURL(activationURL)
          .setStyle(ButtonStyle.Link)
      );
    }

    const response = await interaction.editReply({
      content: `In order to dish praise, you need to activate your account by clicking the Activate button below, and signing a message with your Ethereum wallet: `,
      components: [row],
    });

    return [response, activationURL];
  } catch (error) {
    await interaction.editReply({
      content: 'Unable to activate user account.',
    });
  }
};
