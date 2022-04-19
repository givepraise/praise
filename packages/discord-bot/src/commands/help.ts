import { SlashCommandBuilder } from '@discordjs/builders';
import logger from 'jet-logger';
import { helpHandler } from '../handlers/help';
import { HelpCommandBuilder, Command } from '../interfaces/Command';

export const help: HelpCommandBuilder = (commandNames) => {
  return {
    help: {
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help text for praise')
        .addStringOption((option) =>
          option
            .addChoices(commandNames)
            .setName('cmd')
            .setDescription('The command yuu want to look up')
            .setRequired(false)
        ),

      async execute(interaction) {
        try {
          if (!interaction.isCommand() || interaction.commandName !== 'help')
            return;

          const msg = await interaction.deferReply({
            fetchReply: true,
          });
          if (msg === undefined) return;
          await helpHandler(interaction);
        } catch (err) {
          logger.err(err);
        }
      },
    } as Command,
  };
};
