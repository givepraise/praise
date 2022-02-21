import { MessageEmbed, Role, GuildMember } from 'discord.js';

export const praiseSuccess = (praised: string[], reason: string): string => {
  return `✅ Succesfully praised ${praised.join(', ')} for reason - ${reason}`;
};

export const praiseError = (title: string, description: string): string => {
  return `**❌ ${title}\n${description}`;
};

export const notActivatedError = praiseError(
  'Account Not Activated',
  'Your Account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.'
);

export const dmError = praiseError(
  'Server not found',
  'The praise command can only be used in the discord server.'
);

export const roleError = (
  praiseGiverRole: Role,
  user: GuildMember
): MessageEmbed => {
  return new MessageEmbed()
    .setColor('#ff0000')
    .setTitle(
      'User does not have `{role}`'
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', user?.displayName || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    )
    .setDescription(
      'The praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.'
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', user?.displayName || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
};

export const invalidReceiverError = praiseError(
  'Receivers not mentioned',
  'This command requires atleast one valid receiver to be mentioned, in order for praise to get dished.'
);

export const missingReasonError = praiseError(
  '`reason` not provided',
  'Praise can not be dished or quantified without a `reason`.'
);

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
