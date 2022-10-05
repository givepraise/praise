import { SlashCommandBuilder } from '@discordjs/builders';
import { logger } from 'api/src/shared/logger';
import { helpHandler } from '../handlers/help';
import { HelpCommandBuilder, Command } from '../interfaces/Command';

export const help: HelpCommandBuilder = (commands) => {
  const commandNames: [name: string, value: string][] = Array.from(
    commands
  ).map((i) => [i[0], i[0]]);
  return {
    help: {
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help text for praise')
        .addStringOption((option) =>
          option
            .addChoices(commandNames)
            .setName('command')
            .setDescription('The command you want to look up')
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
          await helpHandler(interaction, commands);
        } catch (err) {
          logger.error(err);
        }
      },
    } as Command,
  };
};
