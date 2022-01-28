import logger from '@shared/Logger';
import { Client, Collection, Intents } from 'discord.js';

import { registerCommands } from './utils/registerCommands';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

if (!process.env.PRAISE_GIVER_ROLE_ID) {
  logger.err('Praise Giver Role not set.');
}

// Create a new client instance
const client = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS'] });

// Set bot commands
(async () => {
  const registerSuccess = await registerCommands(
    client,
    process.env.DISCORD_CLIENT_ID || '',
    process.env.DISCORD_GUILD_ID || ''
  );

  if (registerSuccess) {
    logger.info('All bot commands registered in Guild.');
  } else {
    logger.err('Failed to register bot commands');
  }
})();

client.once('ready', () => {
  logger.info(`Discord client is ready!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
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

export default client;
