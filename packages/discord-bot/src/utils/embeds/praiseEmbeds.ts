import { User, EmbedBuilder, Role } from 'discord.js';
import { apiClient } from '../api';
import { Setting } from '../api-schema';

// /**
//  * Generate success response message for commands/praise
//  *
//  * @param {string[]} praised
//  * @param {string} reason
//  * @returns {Promise<string>}
//  */
export const praiseSuccess = async (
  praised: string[],
  reason: string
): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_SUCCESS_MESSAGE')
    .then((res) =>
      (res.data as Setting).value
        .replace('{@receivers}', `${praised.join(', ')}`)
        .replace('{reason}', reason)
    )
    .catch(() => 'PRAISE SUCCESSFUL (message not set)');

  return msg;
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
  reason: string
): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=FORWARD_SUCCESS_MESSAGE')
    .then((res) =>
      (res.data as Setting).value
        .replace('{@giver}', `<@!${giver.id}>`)
        .replace('{@receivers}', `${receivers.join(', ')}`)
        .replace('{reason}', reason)
    )
    .catch(() => 'PRAISE SUCCESSFUL (message not set)');

  return msg;
};

// /**
//  * Generate response error message PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR
//  *
//  * @returns {Promise<string>}
//  */
export const notActivatedError = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'PRAISE ACCOUNT NOT ACTIVATED (message not set)');
  return msg;
};

// /**
//  * Generate response error message FORWARD_FROM_UNACTIVATED_GIVER_ERROR
//  *
//  * @returns {Promise<string>}
//  */
export const giverNotActivatedError = async (
  praiseGiver: User
): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=FORWARD_FROM_UNACTIVATED_GIVER_ERROR')
    .then((res) =>
      (res.data as Setting).value
        .replace(
          '{giver}',
          `${praiseGiver.username}#${praiseGiver.discriminator}`
        )
        .replace('{@giver}', `<@!${praiseGiver.id}>`)
    )
    .catch(() => "PRAISE GIVER'S ACCOUNT NOT ACTIVATED (message not set)");

  return msg;
};

/**
 * Generate response error message DM_ERROR
 *
 * @returns {Promise<string>}
 */
export const dmError = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=DM_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'COMMAND CAN NOT BE USED IN DM (message not set)');

  return msg;
};

/**
 * Generate response error message PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR
 *
 * @returns {Promise<string>}
 */
export const praiseRoleError = async (
  roles: Role[],
  user: User
): Promise<EmbedBuilder> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'USER DOES NOT HAVE THE PRAISE GIVER ROLE');

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
export const alreadyActivatedError = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'PRAISE ACCOUNT ALREADY ACTIVATED (message not set)');
  return msg;
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const invalidReceiverError = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_INVALID_RECEIVERS_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'VALID RECEIVERS NOT MENTIONED (message not set)');
  return msg;
};

/**
 * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
 *
 * @returns {Promise<string>}
 */
export const missingReasonError = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_REASON_MISSING_ERROR')
    .then((res) => (res.data as Setting).value)
    .catch(() => 'REASON NOT MENTIONED (message not set)');
  return msg;
};

/**
 * Generate response error message PRAISE_UNDEFINED_RECEIVERS_WARNING
 *
 * @returns {Promise<string>}
 */
export const undefinedReceiverWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_UNDEFINED_RECEIVERS_WARNING')
    .then((res) =>
      (res.data as Setting).value
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@user}', `<@!${user?.id || '...'}>`)
        .replace('{@receivers}', receivers)
    )
    .catch(
      () =>
        'UNDEFINED RECEIVERS MENTIONED, UNABLE TO PRAISE THEM (message not set)'
    );
  return msg;
};

/**
 * Generate response error message PRAISE_TO_ROLE_WARNING
 *
 * @returns {Promise<string>}
 */
export const roleMentionWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_TO_ROLE_WARNING')
    .then((res) =>
      (res.data as Setting).value
        .replace('{@receivers}', receivers)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
    )
    .catch(
      () =>
        "ROLES MENTIONED AS PRAISE RECEIVERS, PRAISE CAN'T BE DISHED TO ROLES (message not set)"
    );
  return msg;
};

/**
 * Generate response error message PRAISE_SUCCESS_DM
 *
 * @returns {Promise<string>}
 */
export const praiseSuccessDM = async (
  msgUrl: string,
  isActivated = true
): Promise<EmbedBuilder> => {
  const msg = await apiClient
    .get('/settings?key=PRAISE_SUCCESS_DM')
    .then((res) => (res.data as Setting).value.replace('{praiseURL}', msgUrl))
    .catch(() => `[YOU HAVE BEEN PRAISED!!!](${msgUrl}) (message not set)`);
  const embed = new EmbedBuilder().setColor('#696969');
  if (!isActivated) {
    const notActivatedMsg = await apiClient
      .get('/settings?key=PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM')
      .then((res) => (res.data as Setting).value)
      .catch(
        () =>
          'In order to claim your praise, link your discord account to your ethereum wallet using the `/activate` command'
      );
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
export const selfPraiseWarning = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=SELF_PRAISE_WARNING')
    .then((res) => (res.data as Setting).value)
    .catch(
      () =>
        'SELF-PRAISE NOT ALLOWED, PRAISE GIVERS UNABLE TO PRAISE THEMSELVES (message not set)'
    );
  return msg;
};

/**
 * Generate response info message FIRST_TIME_PRAISER
 *
 * @returns {Promise<string>}
 */
export const firstTimePraiserInfo = async (): Promise<string> => {
  const msg = await apiClient
    .get('/settings?key=FIRST_TIME_PRAISER')
    .then((res) => (res.data as Setting).value)
    .catch(
      () =>
        'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE! (message not set)'
    );
  return msg;
};
