import { ChatInputCommandInteraction } from 'discord.js';
import { DiscordClient } from './DiscordClient';

export type CommandHandler = (
  client: DiscordClient,
  interaction: ChatInputCommandInteraction,
  host: string,
  responseUrl?: string
) => Promise<void>;
