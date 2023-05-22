import {
  ChannelType,
  ChatInputCommandInteraction,
  cleanContent,
} from 'discord.js';

import { UserAccount } from './api-schema';
import { apiClient } from './api';
import { logger } from './logger';

export const createForward = async (
  interaction: ChatInputCommandInteraction,
  giverAccount: UserAccount,
  receiverAccounts: UserAccount[],
  forwarderAccount: UserAccount,
  reason: string,
  host: string
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
    giver: {
      accountId: giverAccount.accountId,
      name: giverAccount.name,
      avatarId: giverAccount.avatarId,
      platform: giverAccount.platform,
    },
    receiverIds: receiverAccounts.map((receiver) => receiver.accountId),
    sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
    sourceName: `DISCORD:${encodeURIComponent(guild.name)}:${encodeURIComponent(
      channelName
    )}`,
    forwarder: {
      accountId: forwarderAccount.accountId,
      name: forwarderAccount.name,
      avatarId: forwarderAccount.avatarId,
      platform: forwarderAccount.platform,
    },
  };

  const response = await apiClient
    .post('/praise/forward', praiseData, {
      headers: { host },
    })
    .then((res) => res.status === 201)
    .catch((err) => {
      logger.error(err?.response?.data || err.message);
      return false;
    });

  return response;
};
