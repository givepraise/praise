import { ChatInputCommandInteraction } from 'discord.js';
import { DiscordClient } from './DiscordClient';

export type CommandHandler = (
  client: DiscordClient,
  interaction: ChatInputCommandInteraction,
  responseUrl?: string
) => Promise<void>;
