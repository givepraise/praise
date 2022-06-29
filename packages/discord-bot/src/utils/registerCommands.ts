import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection } from 'discord.js';
import logger from 'jet-logger';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Command } from '../interfaces/Command';
import { DiscordClient } from '../interfaces/DiscordClient';
import { help } from '../commands/help';

export const registerCommands = async (
  client: DiscordClient
): Promise<boolean> => {
  if (!client.id) {
    logger.err('DISCORD_CLIENT_ID env variable not set.');
  }
  if (!client.guildId) {
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
      const fileData = await import(
        join(process.cwd(), 'src', 'commands', file)
      );
      const name = file.split('.')[0];
      if (name !== 'help') {
        const command = fileData[name] as Command;
        client.commands.set(command.data.name, command);
        commandData.push(command.data);
      }
    }

    const helpCommandBuilder = help(client.commands);
    const helpCommand = helpCommandBuilder['help'];
    client.commands.set(helpCommand.data.name, helpCommand);
    commandData.push(helpCommand.data);

    await rest.put(Routes.applicationGuildCommands(client.id, client.guildId), {
      body: commandData,
    });

    return true;
  } catch (error) {
    logger.err(error);
    return false;
  }
};
