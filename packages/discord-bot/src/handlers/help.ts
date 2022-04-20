import { Collection, CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from 'src/interfaces/Command';

export const helpHandler = async (
  interaction: CommandInteraction,
  commands: Collection<string, Command>
): Promise<void> => {
  const cmd = interaction.options.getString('cmd');
  if (!cmd) {
    await interaction.editReply('Help Command');
    return;
  }
  const commandHelp = commands.get(cmd)?.help;
  if (!commandHelp || !commandHelp.text) {
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle(`\`${cmd}\` command`)
          .setDescription('No HelpText found for this command...'),
      ],
    });
    return;
  }
  const helpEmbed = new MessageEmbed()
    .setTitle(`\`${cmd}\` command`)
    .setDescription(commandHelp.text);

  if (commandHelp.subCommands) {
    for (const subCommandHelp of commandHelp.subCommands) {
      helpEmbed.addField(`${cmd} ${subCommandHelp.name}`, subCommandHelp.text);
    }
  }

  await interaction.editReply({
    embeds: [helpEmbed],
  });
};
