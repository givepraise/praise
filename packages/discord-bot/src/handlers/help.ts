import { Collection, CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from 'src/interfaces/Command';

export const helpHandler = async (
  interaction: CommandInteraction,
  commands: Collection<string, Command>
): Promise<void> => {
  const cmd = interaction.options.getString('command');
  if (!cmd) {
    const cmdDescription: string = Array.from(commands)
      .map((i) => `**${i[1].data.name}** - ${i[1].data.description}`)
      .join('\n');
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('help')
          .setDescription(
            'Welcome to the praise bot!\nTo start using praise, you need to activate praise by using the `/activate` command.\nTo praise, use the `/praise command`.'
          )
          .addField('Commands', cmdDescription),
      ],
    });
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
