import {
  GuildMember,
  EmbedBuilder,
  APIInteractionGuildMember,
  ActionRowBuilder,
  ButtonStyle,
} from 'discord.js';
import { logger } from '../utils/logger';
import { renderMessage } from '../utils/renderMessage';
import { UserAccount } from '../utils/api-schema';
import { ButtonBuilder } from '@discordjs/builders';

export const sendReceiverDM = async (
  receiver: { guildMember: GuildMember; userAccount: UserAccount },
  member: GuildMember | APIInteractionGuildMember,
  reason: string,
  responseUrl: string,
  host: string,
  hostUrl: string,
  guildName: string,
  channelName: string,
  guildIcon?: string,
  isActivated = true
) => {
  try {
    const embed = new EmbedBuilder()
      .setColor('#696969')
      .setDescription(reason)
      .setAuthor({
        name: member.user.username,
        iconURL: member?.avatar || undefined,
      })
      .setFooter({ text: channelName, iconURL: guildIcon });

    if (!isActivated) {
      const notActivatedMsg = await renderMessage(
        'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
        host
      );

      embed.addFields([
        {
          name: '\u200b',
          value: notActivatedMsg,
        },
      ]);
    }

    await receiver.guildMember.send({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(guildName)
            .setStyle(ButtonStyle.Link)
            .setURL(responseUrl),
          new ButtonBuilder()
            .setLabel('Praise Dashboard')
            .setStyle(ButtonStyle.Link)
            .setURL(`${hostUrl}/praise/`)
        ),
      ],
    });
  } catch (err) {
    logger.warn(
      `Can't DM user - ${receiver.userAccount.name} [${receiver.userAccount.accountId}]`
    );
  }
};
