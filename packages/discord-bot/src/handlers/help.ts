import {
  Collection,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { Command } from '../interfaces/Command';
import { logger } from '../utils/logger';
/**
 * Executes command /help
 *  Provides documentation on how to use the praise discord bot
 *
 */
export const helpHandler = async (
  interaction: ChatInputCommandInteraction,
  commands: Collection<string, Command>
): Promise<void> => {
  try {
    const cmd = interaction.options.getString('command');
    if (!cmd) {
      const cmdDescription: string = Array.from(commands)
        .map((i) => `**${i[1].data.name}** - ${i[1].data.description}`)
        .join('\n');
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('help')
            .setDescription(
              'Welcome to the praise bot!\nTo start using praise, you need to activate praise by using the `/activate` command.\nTo praise, use the `/praise command`.'
            )
            .addFields({ name: 'Commands', value: cmdDescription }),
        ],
      });
      return;
    }
    const commandHelp = commands.get(cmd)?.help;
    if (!commandHelp || !commandHelp.text) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`\`${cmd}\` command`)
            .setDescription('No HelpText found for this command...'),
        ],
      });
      return;
    }
    const helpEmbed = new EmbedBuilder()
      .setTitle(`\`${cmd}\` command`)
      .setDescription(commandHelp.text);

    if (commandHelp.subCommands) {
      for (const subCommandHelp of commandHelp.subCommands) {
        helpEmbed.addFields({
          name: `${cmd} ${subCommandHelp.name}`,
          value: subCommandHelp.text,
        });
      }
    }

    await interaction.editReply({
      embeds: [helpEmbed],
    });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error((err as any).message);
    throw err;
  }
};
