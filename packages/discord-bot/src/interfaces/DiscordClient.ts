import { Client, Collection } from 'discord.js';
import { Command } from './Command';
import Keyv from 'keyv';

export interface DiscordClient extends Client {
  id: string;
  guildId: string;
  commands: Collection<string, Command>;
  hostCache: Keyv;
  urlCache: Keyv;
}
