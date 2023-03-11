import { CommandInteraction, EmbedBuilder, User } from 'discord.js';
import { apiClient } from '../api';
import { Setting } from '../api-schema';
/**
 * Generate message outlining user's current activation status
 *
 * @param {UserState} state
 * @returns {EmbedBuilder}
 */
export const praiseForwardEmbed = async (
  interaction: CommandInteraction,
  giver: User,
  receivers: string[],
  reason: string
): Promise<EmbedBuilder> => {
  const msg = await apiClient
    .get('/settings?key=FORWARD_SUCCESS_MESSAGE')
    .then((res) =>
      (res.data as Setting).value
        .replace('{@giver}', `<@!${giver.id}>`)
        .replace('{@receivers}', `${receivers.join(', ')}`)
        .replace('{reason}', reason)
    )
    .catch(() => 'PRAISE SUCCESSFUL (message not set)');

  const { user } = interaction;
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
