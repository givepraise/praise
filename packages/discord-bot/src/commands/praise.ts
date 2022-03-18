import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import { activationHandler } from '../handlers/activate';
import { praiseHandler } from '../handlers/praise';
import { Command } from '../interfaces/Command';
import { getMsgLink } from '../utils/format';

export const praise: Command = {
  data: new SlashCommandBuilder()
    .setName('praise')
    .setDescription('Commands to interact with the praise system')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('dish')
        .setDescription('Dish praise to a User')
        .addStringOption((option) =>
          option
            .setName('receivers')
            .setDescription(
              'Mention the users you would like to send this praise to'
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('The reason for this Praise')
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('activate')
        .setDescription(
          'Activate your praise account by linking your eth address'
        )
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'praise')
        return;

      const subCommand = interaction.options.getSubcommand();

      switch (subCommand) {
        case 'activate':
          await activationHandler(interaction);
          break;
        case 'dish': {
          const msg = (await interaction.deferReply({
            fetchReply: true,
          })) as APIMessage | void;
          if (msg === undefined) return;
          await praiseHandler(
            interaction,
            getMsgLink(
              interaction.guildId || '',
              interaction.channelId || '',
              msg.id
            )
          );
          break;
        }
      }
    } catch (err) {
      logger.err(err);
    }
  },
};
