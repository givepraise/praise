import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from '@discordjs/builders';
import { Collection, CommandInteraction } from 'discord.js';

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
  execute: (interaction: CommandInteraction) => Promise<void>;
  help?: HelpText;
}

export interface HelpCommandBuilder {
  (commands: Collection<string, Command>): { help: Command };
}
