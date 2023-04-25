import { SlashCommandBuilder } from '@discordjs/builders';
import { logger } from '../utils/logger';
import { whoamiHandler } from '../handlers/whoami';
import { Command } from '../interfaces/Command';

export const whoami: Command = {
  data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Find praise info about yourself'),
  async execute(client, interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'whoami')
        return;
      await interaction.deferReply({ ephemeral: true });
      await whoamiHandler(client, interaction);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.error((err as any).message);
    }
  },
};
