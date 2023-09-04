import { User, EmbedBuilder } from 'discord.js';
import { getSetting } from '../settingsUtil';

export const praiseSuccessEmbed = async (
  user: User,
  receivers: string[],
  reason: string,
  host: string
): Promise<EmbedBuilder> => {
  const msg = ((await getSetting('PRAISE_SUCCESS_MESSAGE', host)) as string)
    .replace('{@receivers}', `${receivers.join(', ')}`)
    .replace('{reason}', reason);

  const embed = new EmbedBuilder().setColor(0xe6007e).setDescription(msg);
  return embed;
};
