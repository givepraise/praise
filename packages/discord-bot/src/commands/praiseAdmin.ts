import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import { logger } from 'src/utils/logger';
import { announcementHandler } from '../handlers/announce';
import { Command } from '../interfaces/Command';

export const praiseAdmin: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Commands to perform admin actions for Praise')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('announce')
        .setDescription(
          'Publish announcements distributed as direct messages to Praise users.'
        )
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('The message content to publish.')
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
      logger.error(err);
    }
  },

  help: {
    name: 'admin',
    text: 'Command to perform admin actions in the Praise system and the PraiseBot\n**Usage**: `/admin <announce|...>`\n',
    subCommands: [
      {
        name: 'announce',
        text: 'Command to publish announcements that are distributed as direct messages to Praise users.\nUsage: `/admin announce message: <you have been selected for quantification...>`',
      },
    ],
  },
};
