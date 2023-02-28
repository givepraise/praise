import {
  APIEmbed,
  CacheType,
  ChatInputCommandInteraction,
  JSONEncodable,
} from 'discord.js';

export const ephemeralReply = async (
  interaction: ChatInputCommandInteraction<CacheType>,
  message: { content?: string; embeds?: (APIEmbed | JSONEncodable<APIEmbed>)[] }
): Promise<void> => {
  const { content, embeds } = message;
  //await interaction.deleteReply();
  await interaction.editReply('');
  await interaction.followUp({
    content,
    embeds,
    ephemeral: true,
  });
};
