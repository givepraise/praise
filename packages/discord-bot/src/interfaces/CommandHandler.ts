import { ChatInputCommandInteraction } from 'discord.js';

export type CommandHandler = (
  interaction: ChatInputCommandInteraction,
  responseUrl?: string
) => Promise<void>;
