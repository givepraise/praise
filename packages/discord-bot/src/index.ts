import { Client } from 'discord.js';
import logger from 'jet-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import { DiscordClient } from './interfaces/DiscordClient';
import { registerCommands } from './utils/registerCommands';
import { requiredEnvVariables } from './pre-start/env-required';
import { envCheck } from 'api/src/pre-start/envCheck';

// Check for required ENV variables
envCheck(requiredEnvVariables);

// Start Discord bot
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const discordClient = new Client({
  intents: ['GUILDS', 'GUILD_MEMBERS'],
}) as DiscordClient;

// Set bot commands
void (async (): Promise<void> => {
  discordClient.id = process.env.DISCORD_CLIENT_ID || '';
  discordClient.guildId = process.env.DISCORD_GUILD_ID || '';
  const registerSuccess = await registerCommands(discordClient);

  if (registerSuccess) {
    logger.info('All bot commands registered in Guild.');
  } else {
    logger.err('Failed to register bot commands');
  }
})();

discordClient.once('ready', () => {
  logger.info('Discord client is ready!');
});

discordClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = discordClient.commands.get(interaction.commandName);
  if (!command) return;
  try {
    if (
      interaction.commandName === 'praise' ||
      interaction.commandName === 'forward'
    ) {
      await command.execute(interaction, discordClient);
    } else {
      await command.execute(interaction);
    }
  } catch (error) {
    logger.err(error);
    return interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
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
    logger.err('Could not connect to database.');
  }
  // Login to Discord with your client's token
  await discordClient.login(token);
})();
