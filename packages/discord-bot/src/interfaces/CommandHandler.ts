import { CommandInteraction, Client } from 'discord.js';

export type CommandHandler = (
  interaction: CommandInteraction,
  responseUrl?: string,
  client?: Client
) => Promise<void>;
