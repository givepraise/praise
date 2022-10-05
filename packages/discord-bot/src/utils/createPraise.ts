import { PraiseModel } from 'api/dist/praise/entities';
import { PraiseDocument } from 'api/dist/praise/types';
import { UserAccountDocument } from 'api/dist/useraccount/types';
import {
  ChannelType,
  ChatInputCommandInteraction,
  cleanContent,
} from 'discord.js';

export const createPraise = async (
  interaction: ChatInputCommandInteraction,
  giverAccount: UserAccountDocument,
  receiverAccount: UserAccountDocument,
  reason: string,
  forwarderAccount?: UserAccountDocument
): Promise<PraiseDocument | undefined> => {
  const { channel, guild } = interaction;
  if (!channel || !guild || channel.type === ChannelType.DM) return;

  const channelName =
    (channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.AnnouncementThread ||
      channel.type === ChannelType.PrivateThread) &&
    channel.parent
      ? `${channel.parent.name}/${channel.name}`
      : channel.name;
  const praiseData = {
    reason: reason,
    reasonRealized: cleanContent(reason, channel),
    giver: giverAccount._id,
    forwarder: forwarderAccount?._id || undefined,
    sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
    sourceName: `DISCORD:${encodeURIComponent(guild.name)}:${encodeURIComponent(
      channelName
    )}`,
    receiver: receiverAccount._id,
  };
  return await PraiseModel.create(praiseData);
};
