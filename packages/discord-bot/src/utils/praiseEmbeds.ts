import { MessageEmbed } from 'discord.js';

export const praiseErrorEmbed = (title: string, description: string) => {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle(`ERROR: ${title}`)
    .setDescription(description)
    .setFooter({ text: '❌  PRAISE NOT REGISTERED' });
};

export const praiseSuccess = (praised: string[], reason: string) => {
  return `Succesfully praised ${praised.join(', ')} for reason - ${reason}`
};

export const notActivatedError = '**Account Not Activated**\nYour Account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.';
