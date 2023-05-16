import { ChannelType, CommandInteraction, TextBasedChannel } from 'discord.js';
import { getSetting } from './settingsUtil';

const getChannelId = (channel: TextBasedChannel): string => {
  return channel.type === ChannelType.PublicThread ||
    channel.type === ChannelType.PrivateThread ||
    channel.type === ChannelType.AnnouncementThread
    ? channel?.parent?.id || channel.id
    : channel.id;
};

export const assertPraiseAllowedInChannel = async (
  interaction: CommandInteraction,
  host: string
): Promise<boolean> => {
  const { channel, guild } = interaction;

  if (!channel || !guild) return false;

  const [allowedInAllChannels, allowedChannelsList] = await Promise.all([
    getSetting('PRAISE_ALLOWED_IN_ALL_CHANNELS', host) as Promise<boolean>,
    getSetting('PRAISE_ALLOWED_CHANNEL_IDS', host) as Promise<string[]>,
  ]);

  if (allowedInAllChannels) return true;

  if (!channel) {
    await interaction.editReply({
      content: '**❌ Praise Restricted**\nPraise not allowed here.',
    });
    return false;
  }
  if (!Array.isArray(allowedChannelsList) || allowedChannelsList.length === 0) {
    await interaction.editReply({
      content: '**❌ Praise Restricted**\nPraise not allowed in any channel.',
    });

    return false;
  }

  if (!allowedChannelsList.includes(getChannelId(channel))) {
    await interaction.editReply({
      content: `**❌ Praise Restricted**\nPraise not allowed in this channel.\nTo praise, use the following channels - ${allowedChannelsList
        .filter((el) => el !== '0')
        .map((id) => `<#${id.trim()}>`)
        .join(', ')}`,
    });

    return false;
  }

  return true;
};
