import { ChannelType, CommandInteraction, TextBasedChannel } from 'discord.js';
import { Setting } from './api-schema';
import { apiClient } from './api';

const getChannelId = (channel: TextBasedChannel): string => {
  return channel.type === ChannelType.PublicThread ||
    channel.type === ChannelType.PrivateThread ||
    channel.type === ChannelType.AnnouncementThread
    ? channel?.parent?.id || channel.id
    : channel.id;
};

export const assertPraiseAllowedInChannel = async (
  interaction: CommandInteraction
): Promise<boolean> => {
  const { channel, guild } = interaction;

  if (!channel || !guild) return false;

  const allowedInAllChannels = await apiClient
    .get('/settings?key=PRAISE_ALLOWED_IN_ALL_CHANNELS', {
      headers: { 'x-discord-guild-id': guild.id },
    })
    .then((res) => (res.data as Setting).value === 'true')
    .catch(() => true);

  const allowedChannelsList = await apiClient
    .get('/settings?key=PRAISE_ALLOWED_CHANNEL_IDS', {
      headers: { 'x-discord-guild-id': guild.id },
    })
    .then((res) => (res.data as Setting).value.split(','))
    .catch(() => undefined);

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
