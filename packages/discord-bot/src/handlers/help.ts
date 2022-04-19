import { CommandInteraction, MessageEmbed } from 'discord.js';

export const helpHandler = async (
  interaction: CommandInteraction
): Promise<void> => {
  const cmd = interaction.options.getString('cmd');
  if (!cmd) {
    await interaction.editReply('Help Command');
    return;
  }
  await interaction.editReply({
    embeds: [new MessageEmbed().setTitle(cmd)],
  });
};
