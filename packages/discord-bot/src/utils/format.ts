/**
 * Generate Discord URL linking directly to a message
 *
 * @param {string} guildId
 * @param {string} channelId
 * @param {string} msgID
 * @returns {string}
 */
export const getMsgLink = (
  guildId: string,
  channelId: string,
  msgID: string
): string => `https://discord.com/channels/${guildId}/${channelId}/${msgID}`;
