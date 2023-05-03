import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import { DiscordClient } from './interfaces/DiscordClient';
import { registerCommands } from './utils/registerCommands';
import { requiredEnvVariables } from './pre-start/env-required';
import { envCheck } from './pre-start/envCheck';
import { logger } from './utils/logger';
import { cacheHosts, getHost, getHostId } from './utils/getHost';
import Keyv from 'keyv';
import { apiClient } from './utils/api';
import { Community } from './utils/api-schema';
import { praiseWelcomeEmbed } from './utils/embeds/praiseEmbeds';

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
  discordClient.hostCache = new Keyv();
  discordClient.hostIdCache = new Keyv();
  await cacheHosts(discordClient.hostCache, discordClient.hostIdCache);
});

discordClient.on('interactionCreate', async (interaction): Promise<void> => {
  if (!interaction.isChatInputCommand()) return;
  const command = discordClient.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(discordClient, interaction);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error((error as any).message);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
    return;
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

  if (!channel || channel.type !== ChannelType.GuildText) return;

  const host = await getHost(discordClient, guild.id);
  const hostId = await getHostId(discordClient, guild.id);

  if (!host || !hostId) {
    await channel.send(
      'Welcome to Praise! To use praise, set up your praise instance in the praise portal.'
    );
    return;
  }

  const community = await apiClient
    .get<Community>(`/communities/${hostId}`, {
      headers: { host },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return undefined;
    });

  if (!community) {
    await channel.send('...');
  } else {
    await channel.send({
      embeds: [
        praiseWelcomeEmbed(
          community.name,
          process.env.WEB_URL as string,
          community.discordLinkNonce,
          hostId,
          guild.id
        ),
      ],
    });
  }
});

void (async (): Promise<void> => {
  // Login to Discord with your client's token
  await discordClient.login(process.env.DISCORD_TOKEN);
})();
