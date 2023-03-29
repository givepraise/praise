import {
  ChannelType,
  ChatInputCommandInteraction,
  cleanContent,
} from 'discord.js';

import { UserAccount } from './api-schema';
import { apiClient } from './api';

export const createPraise = async (
  interaction: ChatInputCommandInteraction,
  giverAccount: UserAccount,
  receiverAccount: UserAccount,
  reason: string
): Promise<boolean> => {
  const { channel, guild } = interaction;
  if (!channel || !guild || channel.type === ChannelType.DM) return false;

  const channelName =
    (channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.AnnouncementThread ||
      channel.type === ChannelType.PrivateThread) &&
    channel.parent
      ? `${channel.parent.name} / ${channel.name}`
      : channel.name;

  const praiseData = {
    reason: reason,
    reasonRaw: cleanContent(reason, channel),
    giver: giverAccount,
    sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
    sourceName: `DISCORD:${encodeURIComponent(guild.name)}:${encodeURIComponent(
      channelName
    )}`,
    receiverIds: [receiverAccount.accountId],
  };

  const response = await apiClient
    .post(`/praise`, praiseData, {
      headers: { 'x-discord-guild-id': guild.id },
    })
    .then((res) => res.status === 200)
    .catch(() => false);

  return response;
};
