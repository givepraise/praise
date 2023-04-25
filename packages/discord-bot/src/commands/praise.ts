import { SlashCommandBuilder } from '@discordjs/builders';
import { logger } from '../utils/logger';
import { praiseHandler } from '../handlers/praise';
import { Command } from '../interfaces/Command';
import { getMsgLink } from '../utils/format';

export const praise: Command = {
  data: new SlashCommandBuilder()
    .setName('praise')
    .setDescription('Praise a contribution! 🙏')
    .addStringOption((option) =>
      option
        .setName('receivers')
        .setDescription('Mention the user(s) you would like to praise.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Describe the reason for this praise.')
        .setRequired(true)
    ),

  async execute(client, interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'praise')
        return;

      const msg = await interaction.deferReply({
        fetchReply: true,
        ephemeral: true,
      });
      if (msg === undefined) return;
      await praiseHandler(
        client,
        interaction,
        getMsgLink(
          interaction.guildId || '',
          interaction.channelId || '',
          msg.id
        )
      );
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.error((err as any).message);
    }
  },

  help: {
    name: 'praise',
    text: 'Command to praise users in the discord server. You need to have an activated account on the Praise System to use this command.\n**Usage**: `/praise receivers: <@user1 @user2 ...> reason: for something`\n',
  },
};
