import { User, MessageEmbed, Role } from 'discord.js';
import { getSetting } from './getSettings';

export const praiseSuccess = async (
  praised: string[],
  reason: string
): Promise<string> => {
  const msg = await getSetting('PRAISE_SUCCESS_MESSAGE');
  if (msg && typeof msg === 'string') {
    return msg
      ?.replace('{@receivers}', `${praised.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

export const forwardSuccess = async (
  giver: User,
  receivers: string[],
  reason: string
): Promise<string> => {
  const msg = await getSetting('FORWARD_SUCCESS_MESSAGE');
  if (msg && typeof msg === 'string') {
    return msg
      ?.replace('{@giver}', `<@!${giver.id}>`)
      .replace('{@receivers}', `${receivers.join(', ')}`)
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

export const alreadyActivatedError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'PRAISE ACCOUNT ALREADY ACTIVATED (message not set)';
  }
};

export const giverNotActivatedError = async (
  praiseGiver: User
): Promise<string> => {
  const msg = await getSetting('FORWARD_FROM_UNACTIVATED_GIVER_ERROR');
  if (msg && typeof msg === 'string') {
    return msg
      .replace(
        '{giver}',
        `${praiseGiver.username}#${praiseGiver.discriminator}`
      )
      .replace('{@giver}', `<@!${praiseGiver.id}>`);
  } else {
    return "PRAISE GIVER'S ACCOUNT NOT ACTIVATED (message not set)";
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
  user: User
): Promise<MessageEmbed> => {
  const msg = await getSetting('PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR');
  if (msg && typeof msg === 'string') {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  }
  return new MessageEmbed().setColor('#ff0000').setDescription(
    'USER DOES NOT HAVE {@role} role (message not set)'
      .replace('{role}', praiseGiverRole?.name || '...')
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

export const giverRoleError = async (
  praiseGiverRole: Role,
  user: User
): Promise<MessageEmbed> => {
  const msg = await getSetting(
    'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR'
  );
  if (msg && typeof msg === 'string') {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{giver}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@giver}', `<@!${user?.id || '...'}>`)
    );
  }
  return new MessageEmbed().setColor('#ff0000').setDescription(
    'GIVER DOES NOT HAVE {@role} role (message not set)'
      .replace('{role}', praiseGiverRole?.name || '...')
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

export const invalidReceiverError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_INVALID_RECEIVERS_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  }
  return 'VALID RECEIVERS NOT MENTIONED (message not set)';
};

export const missingReasonError = async (): Promise<string> => {
  const msg = await getSetting('PRAISE_INVALID_RECEIVERS_ERROR');
  if (msg && typeof msg === 'string') {
    return msg;
  }
  return 'REASON NOT MENTIONED (message not set)';
};

export const undefinedReceiverWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = await getSetting('PRAISE_UNDEFINED_RECEIVERS_WARNING');
  if (msg && typeof msg === 'string') {
    return msg
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{@receivers}', receivers);
  }
  return 'UNDEFINED RECEIVERS MENTIONED, UNABLE TO PRAISE THEM (message not set)';
};

export const roleMentionWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = await getSetting('PRAISE_TO_ROLE_WARNING');
  if (msg && typeof msg === 'string') {
    return msg
      .replace('{@receivers}', receivers)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...');
  }
  return "ROLES MENTIONED AS PRAISE RECEIVERS, PRAISE CAN'T BE DISHED TO ROLES (message not set)";
};

export const praiseSuccessDM = async (
  msgUrl: string
): Promise<MessageEmbed> => {
  const msg = await getSetting('PRAISE_SUCCESS_DM');
  if (msg && typeof msg === 'string') {
    return new MessageEmbed()
      .setColor('#696969')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new MessageEmbed().setDescription(
    `[YOU HAVE BEEN PRAISED!!!](${msgUrl}) (message not set)`
  );
};

export const notActivatedDM = async (msgUrl: string): Promise<MessageEmbed> => {
  const msg = await getSetting('PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM');
  if (msg && typeof msg === 'string') {
    return new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('**⚠️  Praise Account Not Activated**')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new MessageEmbed().setDescription(
    `**[YOU HAVE BEEN PRAISED](${msgUrl})\nPRAISE ACCOUNT NOT ACTIVATED. USE \`/activate\` TO ACTIVATE YOUR ACCOUNT. (message not set)`
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
