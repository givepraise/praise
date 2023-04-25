import { User, EmbedBuilder, Role } from 'discord.js';
import { getSetting } from '../settingsUtil';

export const praiseRoleError = async (
  roles: Role[],
  user: User,
  host: string
): Promise<EmbedBuilder> => {
  const msg = (await getSetting(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    host
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

export const praiseSuccessDM = async (
  msgUrl: string,
  isActivated = true,
  host: string
): Promise<EmbedBuilder> => {
  const msg = ((await getSetting('PRAISE_SUCCESS_DM', host)) as string).replace(
    '{praiseURL}',
    msgUrl
  );
  const embed = new EmbedBuilder().setColor('#696969').setDescription(msg);
  if (!isActivated) {
    const notActivatedMsg = (await getSetting(
      'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
      host
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

interface substitutionParams {
  praiseGiver?: User;
  receivers?: string[];
  reason?: string;
  user?: User;
}

export const renderMessage = async (
  key: string,
  host?: string,
  subs?: substitutionParams
): Promise<string> => {
  if (key === 'DM_ERROR' && !host)
    return "The bot can't be used in DMs, please use commands in the server.";

  let msg = (await getSetting(key, host)) as string;

  if (subs) {
    if (subs.user) {
      msg = msg.replace(
        '{user}',
        `${subs.user.username}#${subs.user.discriminator}`
      );
      msg = msg.replace('{@user}', `<@!${subs.user.id || '...'}>`);
    }
    if (subs.praiseGiver) {
      msg = msg.replace(
        '{giver}',
        `${subs.praiseGiver.username}#${subs.praiseGiver.discriminator}`
      );
      msg = msg.replace('{@giver}', `<@!${subs.praiseGiver.id}>`);
    }

    if (subs.reason) {
      msg = msg.replace('{reason}', subs.reason);
    }

    if (subs.receivers) {
      msg = msg.replace('{@receivers}', subs.receivers.join(', '));
    }
  }

  return msg;
};
