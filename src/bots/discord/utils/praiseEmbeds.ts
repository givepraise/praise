import { MessageEmbed } from 'discord.js';

export const praiseErrorEmbed = (title: string, description: string) => {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle(`ERROR: ${title}`)
    .setDescription(description)
    .setFooter({ text: '❌  PRAISE NOT REGISTERED' });
};

export const praiseSuccessEmbed = (praised: string[], reason: string) => {
  return new MessageEmbed()
    .setColor('#00ff00')
    .setTitle(`SUCCESSFULLY PRAISED!`)
    .setDescription(`Praised ${praised.join(', ')}`)
    .addField('Reason', reason)
    .setFooter({ text: '✅  PRAISE REGISTERED' });
};
