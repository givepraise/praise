import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

interface cmdOption {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

interface subCmdHelp {
  name: string;
  description: string;
  usage: string;
  args: cmdOption[];
}

interface cmdHelp extends subCmdHelp {
  subCommands: subCmdHelp[];
}

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: CommandInteraction) => Promise<void>;
  help?: cmdHelp;
}

export interface HelpCommandBuilder {
  (commandNames: [name: string, value: string][]): { help: Command };
}
