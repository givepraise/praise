import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import logger from 'jet-logger';
import { join } from 'path';

// const commandFiles = [activate, praise];

export const registerCommands = async (
  client: Client,
  clientId: string,
  guildId: string
): Promise<boolean> => {
  if (!clientId) {
    logger.err('DISCORD_CLIENT_ID env variable not set.');
  }
  if (!guildId) {
    logger.err('DISCORD_GUILD_ID env variable not set.');
  }

  try {
    logger.info('Started refreshing application (/) commands.');
    const rest = new REST({ version: '9' }).setToken(client.token || '');

    const commandData = [];

    const commandFiles = await readdir(
      join(process.cwd(), 'src', 'commands'),
      'utf-8'
    );
    commandFiles.filter((file) => file.endsWith('.ts'));

    client.commands = new Collection();

    for (const file of commandFiles) {
      const command = await import(
        join(process.cwd(), 'src', 'commands', file)
      );
      commandData.push(command.data);
      client.commands.set(file.split('.')[0], command);
    }

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandData,
    });

    return true;
  } catch (error) {
    logger.err(error);
    return false;
  }
};
