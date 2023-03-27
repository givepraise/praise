import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';

/**
 * Generate message outlining user's current activation status
 *
 * @param {UserState} state
 * @returns {EmbedBuilder}
 */
export const praiseSuccessEmbed = async (
  interaction: CommandInteraction,
  receivers: string[],
  reason: string
): Promise<EmbedBuilder> => {
  const successMessage = (await settingValue(
    'PRAISE_SUCCESS_MESSAGE'
  )) as string;
  let msg;
  if (successMessage) {
    msg = successMessage
      .replace('{@receivers}', `${receivers.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    msg = 'PRAISE SUCCESSFUL (message not set)';
  }
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
