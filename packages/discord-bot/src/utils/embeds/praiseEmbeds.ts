import { User, EmbedBuilder, Role, Embed } from 'discord.js';
import { renderMessage } from '../renderMessage';

export const praiseRoleError = async (
  roles: Role[],
  user: User,
  host: string
): Promise<EmbedBuilder> => {
  const msg = await renderMessage(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    host,
    { user, roles }
  );

  return new EmbedBuilder().setColor('#ff0000').setDescription(msg);
};

export const communityNotCreatedError = (webUrl: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setTitle(
      '🔴  No Praise Community has been created for this Discord Server'
    )
    .setDescription(
      `Follow below link and create a Praise community. Then return to discord to complete linking the bot to your community.\n\n[Create your praise community](${webUrl})`
    );
};

export const praiseWelcomeEmbed = (
  name: string,
  webUrl: string,
  nonce: string,
  isActive: boolean,
  hostId: string,
  guildId: string
): EmbedBuilder => {
  if (!isActive) {
    return new EmbedBuilder()
      .setTitle('🔴  The bot has not yet been linked with a Praise Community.')
      .setDescription(
        `Follow below link and sign a message with your wallet to secure the connection between the bot and the newly setup community.\n[Link Praise Bot to "${name}"](${webUrl}/discord-bot/link?nonce=${nonce}&communityId=${hostId}&guildId=${guildId}`
      );
  }
  return new EmbedBuilder()
    .setTitle('Welcome to Praise!')
    .setDescription(
      `✅ Praise community created\n✅ Praise bot added to Discord\n✅ Praise bot linked to community\n`
    );
};
