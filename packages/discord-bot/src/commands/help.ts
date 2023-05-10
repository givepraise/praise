import { SlashCommandBuilder } from '@discordjs/builders';
import { helpHandler } from '../handlers/help';
import { HelpCommandBuilder, Command } from '../interfaces/Command';

export const help: HelpCommandBuilder = (commands) => {
  return {
    help: {
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help text for praise')
        .addStringOption((option) =>
          option
            .setName('command')
            .setDescription('The command you want to look up')
            .setAutocomplete(true)
            .setRequired(false)
        ),

      async execute(client, interaction) {
        if (!interaction.isCommand() || interaction.commandName !== 'help')
          return;

        await helpHandler(interaction, commands);
      },
    } as Command,
  };
};
