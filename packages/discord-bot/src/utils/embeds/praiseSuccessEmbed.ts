import { User, EmbedBuilder } from 'discord.js';
import { getSetting } from '../settingsUtil';

export const praiseSuccessEmbed = async (
  user: User,
  receivers: string[],
  reason: string,
  host: string,
  praiseNotificationsEnabled = true
): Promise<EmbedBuilder> => {
  let msg = (await getSetting('PRAISE_SUCCESS_MESSAGE', host)) as string;

  if (!praiseNotificationsEnabled) {
    msg = msg.replace('{@receivers}', '[HIDDEN]');
  } else {
    msg = msg.replace('{@receivers}', `${receivers.join(', ')}`);
  }
  msg = msg.replace('{reason}', reason);

  const embed = new EmbedBuilder().setColor(0xe6007e).setDescription(msg);
  return embed;
};
