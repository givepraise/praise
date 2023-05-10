import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
} from '@discordjs/builders';
import { Collection, ChatInputCommandInteraction, Message } from 'discord.js';
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
    interaction: ChatInputCommandInteraction,
    host: string,
    msg: Message<boolean>
  ) => Promise<void>;
  help?: HelpText;
}

export interface HelpCommandBuilder {
  (commands: Collection<string, Command>): {
    help: Command;
  };
}
