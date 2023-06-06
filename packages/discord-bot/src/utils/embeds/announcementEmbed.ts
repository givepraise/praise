import { APIUser, EmbedBuilder, Guild, User } from 'discord.js';

export const announcementEmbed = (
  author: User | APIUser,
  guild: Guild,
  message: string
): EmbedBuilder => {
  return new EmbedBuilder()
    .setTitle('Announcement')
    .setDescription(message)
    .setAuthor({
      name: author.username,
      iconURL: `https://cdn.discordapp.com/avatars/${author.id}/${
        author.avatar || 'undefined'
      }.png`,
    })
    .setFooter({
      text: guild.name,
      iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${
        guild.icon || 'undefined'
      }.png`,
    });
};
