import { Client, Collection } from 'discord.js';
import { Command } from './Command';

export interface DiscordClient extends Client {
  id: string;
  guildId: string;
  commands: Collection<string, Command>;
}
