import { User, Role } from 'discord.js';
import { getSetting } from './settingsUtil';

interface substitutionParams {
  praiseGiver?: User;
  receivers?: string[];
  reason?: string;
  user?: User;
  roles?: Role[];
  praiseUrl?: string;
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
    if (subs.user)
      msg = msg
        .replace('{user}', `${subs.user.username}#${subs.user.discriminator}`)
        .replace('{@user}', `<@!${subs.user.id || '...'}>`);

    if (subs.praiseGiver)
      msg = msg
        .replace(
          '{giver}',
          `${subs.praiseGiver.username}#${subs.praiseGiver.discriminator}`
        )
        .replace('{@giver}', `<@!${subs.praiseGiver.id}>`);

    if (subs.reason) msg = msg.replace('{reason}', subs.reason);

    if (subs.receivers)
      msg = msg.replace('{@receivers}', subs.receivers.join(', '));

    if (subs.roles)
      msg = msg
        .replace('{roles}', subs.roles.map((r) => r.name).join(', '))
        .replace('{@roles}', subs.roles.map((r) => `<@&${r.id}>`).join(', '));

    if (subs.praiseUrl)
      msg = msg
        .replace('{praiseUrl}', subs.praiseUrl)
        .replace('{praiseURL}', subs.praiseUrl);
  }

  return msg;
};
