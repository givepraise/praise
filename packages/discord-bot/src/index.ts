import { Client, GatewayIntentBits } from 'discord.js';
import mongoose, { ConnectOptions } from 'mongoose';
import { envCheck } from 'api/dist/pre-start/envCheck';
import { DiscordClient } from './interfaces/DiscordClient';
import { registerCommands } from './utils/registerCommands';
import { requiredEnvVariables } from './pre-start/env-required';
import { logger } from './utils/logger';

// Check for required ENV variables
envCheck(requiredEnvVariables);

// Start Discord bot
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as DiscordClient;

// Set bot commands
void (async (): Promise<void> => {
  discordClient.id = process.env.DISCORD_CLIENT_ID || '';
  discordClient.guildId = process.env.DISCORD_GUILD_ID || '';
  const registerSuccess = await registerCommands(discordClient);

  if (registerSuccess) {
    logger.info('All bot commands registered in Guild.');
  } else {
    logger.error('Failed to register bot commands');
  }
})();

discordClient.once('ready', () => {
  logger.info('Discord client is ready!');
});

discordClient.on('interactionCreate', async (interaction): Promise<void> => {
  if (!interaction.isChatInputCommand()) return;
  const command = discordClient.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
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

// Connect to database
void (async (): Promise<void> => {
  logger.info('Connecting to database…');
  const host = process.env.MONGO_HOST || '';
  const port = process.env.MONGO_PORT || '';
  const dbName = process.env.MONGO_DB || '';
  const username = process.env.MONGO_USERNAME || '';
  const password = process.env.MONGO_PASSWORD || '';

  try {
    const db = `mongodb://${username}:${password}@${host}:${port}/${dbName}`;
    await mongoose.connect(db, {
      useNewUrlParser: true,
    } as ConnectOptions);
    logger.info('Connected to database.');
  } catch (error) {
    logger.error('Could not connect to database.');
  }
  // Login to Discord with your client's token
  await discordClient.login(token);
})();
