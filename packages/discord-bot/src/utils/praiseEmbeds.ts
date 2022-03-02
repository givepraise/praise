import { GuildMember, MessageEmbed, Role } from 'discord.js';
import { getSetting } from './getSettings';

export const praiseSuccess = async (
  praised: string[],
  reason: string
): Promise<string> => {
  const msg = await getSetting('PRAISE_SUCCESS_MESSAGE');
  if (msg && typeof msg === 'string') {
    return msg
      ?.replace('{praiseReceivers}', `${praised.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

export const praiseError = (title: string, description: string): string => {
  return `**❌ ${title}**\n${description}`;
};

export const notActivatedError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'PRAISE ACCOUNT NOT ACTIVATED (message not set)';
  }
};

export const dmError = async (): Promise<string> => {
  const msg = await getSetting('DM_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'COMMAND CAN NOT BE USED IN DM (message not set)';
  }
};

export const roleError = async (
  praiseGiverRole: Role,
  user: GuildMember
): Promise<MessageEmbed> => {
  const msg = await getSetting('PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR');
  if (msg && typeof msg === 'string') {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', user?.displayName || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  } else {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      'USER DOES NOT HAVE {@role} role (message not set)'
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', user?.displayName || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  }
};

export const invalidReceiverError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_INVALID_RECEIVERS_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'VALID RECEIVERS NOT MENTIONED (message not set)';
  }
};

export const missingReasonError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_INVALID_RECEIVERS_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'REASON NOT MENTIONED (message not set)';
  }
};

export const undefinedReceiverWarning = (
  receivers: string,
  userId: string
): string => {
  return `**⚠️  Undefined Receivers**\nCould not praise ${receivers}.\n<@!${userId}>, this warning could have been caused when a user isn't mentioned properly in the praise receivers field OR when a user isn't found in the discord server.`;
};

export const roleMentionWarning = (
  receivers: string,
  userId: string
): string => {
  return `**⚠️  Roles as Praise receivers**\nCouldn't praise roles - ${receivers}.\n<@!${userId}>, use the \`/group-praise\` for distribution of praise to all the members that have certain discord roles.`;
};

export const praiseSuccessDM = (msgUrl: string): MessageEmbed => {
  return new MessageEmbed()
    .setColor('#696969')
    .setTitle('👏 Congratulations! You’ve been Praised! 👏')
    .setDescription(
      `[View your praise in the TEC](${msgUrl})\n**Thank you** for supporting the Token Engineering Commons!`
    );
};

export const notActivatedDM = (msgUrl: string): MessageEmbed => {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('**⚠️  Praise Account Not Activated**')
    .setDescription(
      `You were just [praised in the TEC](${msgUrl})\nIt looks like you haven't activated your account... To activate your account, use the \`/praise-activate\` command in the server.`
    );
};

/*
  const addInfoFields = (embed: MessageEmbed) => {
    embed.addField(
      'Valid Receivers',
      receiverData.validReceiverIds?.join(', ') || 'No Receivers Mentioned.'
    );
    if (receiverData.undefinedReceivers) {
      embed.addField(
        'Undefined Receivers',
        (receiverData.undefinedReceivers?.join(', ') || '') +
          "\nThese users don't exist in the system, and hence can't be praised."
      );
    }
    if (receiverData.roleMentions) {
      embed.addField(
        'Roles Mentioned',
        (receiverData.roleMentions?.join(', ') || '') +
          "\nYou can't dish praise to entire roles."
      );
    }
    embed.addField('Reason', reason || 'No reason entered.');
    return embed;
  };
*/
