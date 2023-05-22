import {
  ChannelType,
  ChatInputCommandInteraction,
  cleanContent,
} from 'discord.js';

import { UserAccount } from './api-schema';
import { apiPost } from './api';
import { logger } from './logger';

export const createPraise = async (
  interaction: ChatInputCommandInteraction,
  giverAccount: UserAccount,
  receiverAccounts: UserAccount[],
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
  };

  const response = await apiPost('/praise', praiseData, {
      headers: { host: host },
    });

  return response.status === 201;
};
