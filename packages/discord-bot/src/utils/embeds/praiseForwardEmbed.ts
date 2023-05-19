import { CommandInteraction, EmbedBuilder, User } from 'discord.js';
import { getSetting } from '../settingsUtil';

export const praiseForwardEmbed = async (
  interaction: CommandInteraction,
  giver: User,
  receivers: string[],
  reason: string,
  host: string
): Promise<EmbedBuilder> => {
  const msg = ((await getSetting('FORWARD_SUCCESS_MESSAGE', host)) as string)
    .replace('{@giver}', `<@!${giver.id}>`)
    .replace('{@receivers}', `${receivers.join(', ')}`)
    .replace('{reason}', reason);

  const embed = new EmbedBuilder().setColor(0xe6007e).setDescription(msg);

  return embed;
};
