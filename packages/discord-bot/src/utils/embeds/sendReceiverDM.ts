import {
  GuildMember,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { logger } from '../logger';
import { renderMessage } from '../renderMessage';
import { UserAccount } from '../api-schema';

export const sendReceiverDM = async (
  receiver: { guildMember: GuildMember; userAccount: UserAccount },
  member: GuildMember,
  reason: string,
  responseUrl: string,
  host: string,
  hostUrl: string,
  channelId: string,
  isActivated = true
): Promise<void> => {
  try {
    const channel = await member.guild.channels.fetch(channelId);
    const embed = new EmbedBuilder()
      .setColor('#696969')
      .setDescription(reason)
      .setAuthor({
        name: member.user.username,
        iconURL: `https://cdn.discordapp.com/avatars/${member.id}/${
          member.user.avatar || 'undefined'
        }.png`,
      })
      .setFooter({
        text: channel?.name || channelId,
        iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${
          member.guild.icon || 'undefined'
        }.png`,
      });

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
            .setLabel(member.guild.name)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error((err as any).message);
    logger.warn(
      `Can't DM user - ${receiver.userAccount.name} [${receiver.userAccount.accountId}]`
    );
  }
};
