import { User, EmbedBuilder, Role } from 'discord.js';
import { getSetting } from '../settingsUtil';

// /**
//  * Generate success response message for commands/praise
//  *
//  * @param {string[]} praised
//  * @param {string} reason
//  * @returns {Promise<string>}
//  */
export const praiseSuccess = async (
  praised: string[],
  reason: string,
  guildId: string
): Promise<string> => {
  return ((await getSetting('PRAISE_SUCCESS_MESSAGE', guildId)) as string)
    .replace('{@receivers}', `${praised.join(', ')}`)
    .replace('{reason}', reason);
};

// /**
//  * Generate success response message for commands/forward
//  *
//  * @param {User} giver
//  * @param {string[]} receivers
//  * @param {string} reason
//  * @returns   {Promise<string>}
//  */
export const forwardSuccess = async (
  giver: User,
  receivers: string[],
  reason: string,
  guildId: string
): Promise<string> => {
  return ((await getSetting('FORWARD_SUCCESS_MESSAGE', guildId)) as string)
    .replace('{@giver}', `<@!${giver.id}>`)
    .replace('{@receivers}', `${receivers.join(', ')}`)
    .replace('{reason}', reason);
};

// /**
//  * Generate response error message PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR
//  *
//  * @returns {Promise<string>}
//  */
export const notActivatedError = async (guildId: string): Promise<string> => {
  return (await getSetting(
    'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    guildId
  )) as string;
};

// /**
//  * Generate response error message FORWARD_FROM_UNACTIVATED_GIVER_ERROR
//  *
//  * @returns {Promise<string>}
//  */
export const giverNotActivatedError = async (
  praiseGiver: User,
  guildId: string
): Promise<string> => {
  const msg = (
    (await getSetting(
      'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
      guildId
    )) as string
  )
    .replace('{giver}', `${praiseGiver.username}#${praiseGiver.discriminator}`)
    .replace('{@giver}', `<@!${praiseGiver.id}>`);
  return msg;
};

/**
 * Generate response error message DM_ERROR
 *
 * @returns {Promise<string>}
 */
export const dmError = async (): Promise<string> => {
  return (await getSetting('DM_ERROR')) as string;
};

/**
 * Generate response error message PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR
 *
 * @returns {Promise<string>}
 */
export const praiseRoleError = async (
  roles: Role[],
  user: User,
  guildId: string
): Promise<EmbedBuilder> => {
  const msg = (await getSetting(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    guildId
  )) as string;

  const roleNames = roles.map((r) => r.name).join(', ');
  const roleMentions = roles.map((r) => `<@&${r.id}>`).join(', ');

  if (msg) {
    return new EmbedBuilder().setColor('#ff0000').setDescription(
      msg
        .replace('{roles}', roleNames)
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@roles}', roleMentions)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  }
  return new EmbedBuilder().setColor('#ff0000').setDescription(
    'USER DOES NOT HAVE {@role} role (message not set)'
      .replace('{roles}', roleNames)
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@roles}', roleMentions)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

/**
 * Generate response error message PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR
 *
 * @returns {Promise<string>}
 */
export const alreadyActivatedError = async (
  guildId: string
): Promise<string> => {
  return (await getSetting(
    'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
    guildId
  )) as string;
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const invalidReceiverError = async (
  guildId: string
): Promise<string> => {
  return (await getSetting(
    'PRAISE_INVALID_RECEIVERS_ERROR',
    guildId
  )) as string;
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const missingReasonError = async (guildId: string): Promise<string> => {
  return (await getSetting('PRAISE_REASON_MISSING_ERROR', guildId)) as string;
};

/**
 * Generate response error message PRAISE_UNDEFINED_RECEIVERS_WARNING
 *
 * @returns {Promise<string>}
 */
export const undefinedReceiverWarning = async (
  receivers: string,
  user: User,
  guildId: string
): Promise<string> => {
  const msg = (
    (await getSetting('PRAISE_UNDEFINED_RECEIVERS_WARNING', guildId)) as string
  )
    .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
    .replace('{@user}', `<@!${user?.id || '...'}>`)
    .replace('{@receivers}', receivers);
  return msg;
};

/**
 * Generate response error message PRAISE_TO_ROLE_WARNING
 *
 * @returns {Promise<string>}
 */
export const roleMentionWarning = async (
  receivers: string,
  user: User,
  guildId: string
): Promise<string> => {
  const msg = ((await getSetting('PRAISE_TO_ROLE_WARNING', guildId)) as string)
    .replace('{@receivers}', receivers)
    .replace('{@user}', `<@!${user?.id || '...'}>`)
    .replace('{user}', `${user?.username}#${user?.discriminator}` || '...');
  return msg;
};

/**
 * Generate response error message PRAISE_SUCCESS_DM
 *
 * @returns {Promise<string>}
 */
export const praiseSuccessDM = async (
  msgUrl: string,
  isActivated = true,
  guildId: string
): Promise<EmbedBuilder> => {
  const msg = (
    (await getSetting('PRAISE_SUCCESS_DM', guildId)) as string
  ).replace('{praiseURL}', msgUrl);
  const embed = new EmbedBuilder().setColor('#696969');
  if (!isActivated) {
    const notActivatedMsg = (await getSetting(
      'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
      guildId
    )) as string;

    embed.addFields([
      {
        name: '\u200b',
        value: notActivatedMsg,
      },
    ]);
  }

  return embed;
};

/**
 * Generate response error message SELF_PRAISE_WARNING
 *
 * @returns {Promise<string>}
 */
export const selfPraiseWarning = async (guildId: string): Promise<string> => {
  return (await getSetting('SELF_PRAISE_WARNING', guildId)) as string;
};

/**
 * Generate response info message FIRST_TIME_PRAISER
 *
 * @returns {Promise<string>}
 */
export const firstTimePraiserInfo = async (
  guildId: string
): Promise<string> => {
  return (await getSetting('FIRST_TIME_PRAISER', guildId)) as string;
};

export const renderMessage = async (
  key: string,
  guildId: string
): Promise<string> => {
  const msg = (await getSetting(key, guildId)) as string;
  switch (key) {
  }
  return msg;
};
