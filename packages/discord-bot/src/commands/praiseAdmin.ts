import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import logger from 'jet-logger';
import { dmHandler } from '../handlers/dm';
import { Command } from '../interfaces/Command';

export const praiseAdmin: Command = {
  data: new SlashCommandBuilder()
    .setName('praise-admin')
    .setDescription('Commands to perform admin actions for Praise')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('dm')
        .setDescription('Sends automated DMs to Quantifiers')
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription(
              'The message content that you want to send in the DMs'
            )
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    try {
      if (
        !interaction.isCommand() ||
        interaction.commandName !== 'praise-admin'
      )
        return;

      const subCommand = interaction.options.getSubcommand();

      await interaction.deferReply({ ephemeral: true });
      switch (subCommand) {
        case 'dm': {
          await dmHandler(interaction);
          break;
        }
      }
    } catch (err) {
      logger.err(err);
    }
  },
};
