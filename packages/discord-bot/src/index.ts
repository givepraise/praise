import { Client, Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import logger from 'jet-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import path from 'path';
import { registerCommands } from './utils/registerCommands';

const load = dotenv.config({ path: path.join(__dirname, '..', '/.env') });
if (load.error) {
  logger.err(load.error.message);
  process.exit();
}
declare module 'discord.js' {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

if (!process.env.PRAISE_GIVER_ROLE_ID) {
  logger.err('Praise Giver Role not set.');
}

// Start Discord bot
const token = process.env.DISCORD_TOKEN;
if (!token) {
  logger.err('Discord token not set.');
  process.exit();
}

// Create a new client instance
const discordClient = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS'] });

// Set bot commands
(async () => {
  const registerSuccess = await registerCommands(
    discordClient,
    process.env.DISCORD_CLIENT_ID || '',
    process.env.DISCORD_GUILD_ID || ''
  );

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
(async () => {
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
})();

// Login to Discord with your client's token
discordClient.login(token);
