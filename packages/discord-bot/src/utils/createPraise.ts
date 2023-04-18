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

  // if (typeof giverAccount.user !== 'string')
  //   giverAccount.user = giverAccount.user._id;

  const praiseData = {
    reason: reason,
    reasonRaw: cleanContent(reason, channel),
    giver: {
      accountId: giverAccount.accountId,
      name: giverAccount.name,
      avatarId: giverAccount.avatarId,
      platform: giverAccount.platform,
    },
    receiverIds: [receiverAccount.accountId],
    sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
    sourceName: `DISCORD:${encodeURIComponent(guild.name)}:${encodeURIComponent(
      channelName
    )}`,
  };

  const response = await apiClient
    .post('/praise', praiseData, {
      headers: { host: host },
    })
    .then((res) => res.status === 201)
    .catch((err) => {
      console.log(err);
      return false;
    });

  return response;
};
