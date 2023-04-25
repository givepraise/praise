import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Command } from '../interfaces/Command';
import { DiscordClient } from '../interfaces/DiscordClient';
import { help } from '../commands/help';
import { logger } from './logger';

/**
 * Register (install) all commands to Discord
 *
 * @param {DiscordClient} client
 * @returns {Promise<boolean>}
 */
export const registerCommands = async (
  client: DiscordClient,
  guildId?: string
): Promise<boolean> => {
  if (!client.id) {
    logger.error('DISCORD_CLIENT_ID env variable not set.');
  }

  try {
    logger.info('Started refreshing application (/) commands.');
    const rest = new REST({ version: '10' }).setToken(client.token || '');

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

    if (guildId) {
      logger.info(`Registering commands for guild - ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(client.id, guildId), {
        body: commandData,
      });
    } else {
      logger.info('Registering commands globally');
      await rest.put(Routes.applicationCommands(client.id), {
        body: commandData,
      });
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error((error as any).message);
    return false;
  }
};
