import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import logger from 'jet-logger';
import { announcementHandler } from '../handlers/announce';
import { Command } from '../interfaces/Command';

export const praiseAdmin: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Commands to perform admin actions for Praise')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('announce')
        .setDescription("Automatically announce messages in Users' DMs")
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
      if (!interaction.isCommand() || interaction.commandName !== 'admin')
        return;

      const subCommand = interaction.options.getSubcommand();

      await interaction.deferReply({ ephemeral: true });
      switch (subCommand) {
        case 'announce': {
          await announcementHandler(interaction);
          break;
        }
      }
    } catch (err) {
      logger.err(err);
    }
  },
};
