import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import { DiscordClient } from './interfaces/DiscordClient';
import { registerCommands } from './utils/registerCommands';
import { requiredEnvVariables } from './pre-start/env-required';
import { envCheck } from './pre-start/envCheck';
import { logger } from './utils/logger';
import { buildCommunityCache, getCommunityFromCache } from './utils/getHost';
import Keyv from 'keyv';
import {
  communityNotCreatedError,
  praiseWelcomeEmbed,
} from './utils/embeds/praiseEmbeds';
import { renderMessage } from './utils/renderMessage';

envCheck(requiredEnvVariables);

// Create a new client instance
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as DiscordClient;

// Set bot commands

void (async (): Promise<void> => {
  discordClient.id = process.env.DISCORD_CLIENT_ID as string;

  const registerSuccess = await registerCommands(
    discordClient,
    process.env.NODE_ENV && process.env.NODE_ENV === 'development'
      ? process.env.DISCORD_GUILD_ID
      : undefined
  );

  if (registerSuccess) logger.info('All bot commands registered.');
  else logger.error('Failed to register bot commands');
})();

discordClient.once('ready', async () => {
  logger.info('Discord client is ready!');
  discordClient.communityCache = new Keyv();
  await buildCommunityCache(discordClient.communityCache);
});

discordClient.on('interactionCreate', async (interaction): Promise<void> => {
  if (!interaction.isChatInputCommand()) return;

  const command = discordClient.commands.get(interaction.commandName);

  if (!command) return;

  try {
    if (!interaction.guild) {
      await interaction.reply(await renderMessage('DM_ERROR'));
      return;
    }

    logger.debug(
      `Interaction /${interaction.commandName} used by ${
        interaction.user.username
      } from ${interaction.guild?.name} with options - ${JSON.stringify(
        interaction.options.data
      )}`
    );

    const community = await getCommunityFromCache(
      discordClient,
      interaction.guild.id
    );
    console.log(community);

    if (community) {
      await command.execute(discordClient, interaction, community.hostname);
    } else {
      await interaction.reply({
        embeds: [communityNotCreatedError(process.env.WEB_URL as string)],
      });
    }
  } catch {
    logger.error(
      `Interaction /${interaction.commandName} failed for ${
        interaction.user.username
      } in ${interaction.guild?.name || 'dm'}(${
        interaction.guildId || interaction.applicationId
      })`
    );
    const content = `There was an error while executing the \`/${interaction.commandName}\` command`;

    if (interaction.deferred) await interaction.editReply({ content });
    else await interaction.reply({ content });
  }
});

// Mount interactionCreate hook for autocompleting help command
discordClient.on('interactionCreate', async (interaction): Promise<void> => {
  if (!interaction.isAutocomplete()) return;
  if (interaction.commandName === 'help') {
    const focusedValue = interaction.options.getFocused();
    const filtered = discordClient.commands
      .filter((k, v) => v.startsWith(focusedValue))
      .map((command, choice) => ({ name: choice, value: choice }));
    await interaction.respond(filtered);
  }
});

discordClient.on('guildCreate', async (guild): Promise<void> => {
  const channel = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText
  );

  try {
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const community = await getCommunityFromCache(discordClient, guild.id);

    if (!community) {
      await channel.send({
        embeds: [communityNotCreatedError(process.env.WEB_URL as string)],
      });
    } else {
      await channel.send({
        embeds: [
          praiseWelcomeEmbed(
            community.name,
            process.env.WEB_URL as string,
            community.discordLinkNonce,
            community.discordLinkState === 'ACTIVE',
            community._id,
            guild.id
          ),
        ],
      });
    }
  } catch (err) {
    logger.warn("Can't access server");
  }
});

void (async (): Promise<void> => {
  // Login to Discord with your client's token
  await discordClient.login(process.env.DISCORD_TOKEN);
})();
