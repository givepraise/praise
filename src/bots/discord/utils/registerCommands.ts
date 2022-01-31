import { logger } from '@shared/Logger';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { Collection, Client } from 'discord.js';

import { readdir } from 'fs/promises';
import { join } from 'path';

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
      join(process.cwd(), 'src', 'bots', 'discord', 'commands'),
      'utf-8'
    );
    commandFiles.filter((file) => file.endsWith('.ts'));

    client.commands = new Collection();

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      const data = command.data.toJSON();
      commandData.push(data);
      client.commands.set(command.data.name, command);
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
