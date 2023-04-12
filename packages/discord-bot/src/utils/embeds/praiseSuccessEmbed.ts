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

  const embed = new EmbedBuilder()
    .setColor(0xe6007e)
    .setAuthor({
      name: user.username,
      iconURL: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
        : 'https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png',
      url: `${process.env.FRONTEND_URL as string}/users/${user.id}`,
    })
    .setDescription(msg);
  return embed;
};
