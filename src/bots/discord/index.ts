import logger from '@shared/Logger';
import { Client, Collection, Intents } from 'discord.js';
import fs from 'fs';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<unknown, any>;
  }
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Set bot commands
client.commands = new Collection();
const commandFiles = fs
  .readdirSync('./src/bots/discord/commands')
  .filter((file) => file.endsWith('.ts'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  logger.info(`Setting command: ${command.data.name}`);
  client.commands.set(command.data.name, command);
}

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
    console.error(error);
    return interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

export default client;
