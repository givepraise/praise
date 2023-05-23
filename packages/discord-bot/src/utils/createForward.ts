import {
  ChannelType,
  ChatInputCommandInteraction,
  cleanContent,
} from 'discord.js';

import { Praise, UserAccount } from './api-schema';
import { apiPost } from './api';

interface PraiseForwardInputDto {
  reason: string;
  reasonRaw: string;
  giver: {
    accountId: string;
    name: string;
    avatarId?: string;
    platform: string;
  };
  forwarder: {
    accountId: string;
    name: string;
    avatarId?: string;
    platform: string;
  };
  receiverIds: string[];
  sourceId: string;
  sourceName: string;
}

export const createForward = async (
  interaction: ChatInputCommandInteraction,
  giverAccount: UserAccount,
  receiverAccounts: UserAccount[],
  forwarderAccount: UserAccount,
  reason: string,
  host: string
): Promise<Praise[]> => {
  const { channel, guild } = interaction;
  if (!channel || !guild || channel.type === ChannelType.DM) return [];

  const channelName =
    (channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.AnnouncementThread ||
      channel.type === ChannelType.PrivateThread) &&
    channel.parent
      ? `${channel.parent.name} / ${channel.name}`
      : channel.name;

  const praiseData: PraiseForwardInputDto = {
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

  const response = await apiPost<Praise[], PraiseForwardInputDto>(
    '/praise/forward',
    praiseData,
    {
      headers: { host },
    }
  );

  return response.data;
};
