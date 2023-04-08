import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from '@discordjs/builders';
import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { DiscordClient } from './DiscordClient';

interface HelpText {
  name: string;
  text: string;
  subCommands?: HelpText[];
}

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  help?: HelpText;
}

export interface HelpCommandBuilder {
  (commands: Collection<string, Command>): {
    help: Command;
  };
}
