import { Client } from 'discord.js';
import * as dotenv from 'dotenv';
import logger from 'jet-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import path from 'path';
import { DiscordClient } from './interfaces/DiscordClient';
import { registerCommands } from './utils/registerCommands';

let env = dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}
env = dotenv.config({
  path: path.join(__dirname, '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}

if (!process.env.PRAISE_GIVER_ROLE_ID) {
  logger.err('Praise Giver Role not set.');
}

// Start Discord bot
const token = process.env.DISCORD_TOKEN;
const frontendUrl = process.env.FRONTEND_URL;

if (!token) {
  logger.err('Discord token not set.');
  throw new Error('Discord token not set.');
}

if (!frontendUrl) {
  logger.err('FRONTEND_URL not set.');
}

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
    await command.execute(interaction);
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
