import { CommandInteraction } from 'discord.js';

export type CommandHandler = (
  interaction: CommandInteraction,
  responseUrl?: string
) => Promise<void>;
