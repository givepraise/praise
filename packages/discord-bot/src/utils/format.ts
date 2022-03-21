export const getMsgLink = (
  guildId: string,
  channelId: string,
  msgID: string
): string => `https://discord.com/channels/${guildId}/${channelId}/${msgID}`;
