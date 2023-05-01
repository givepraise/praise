import { User, EmbedBuilder, Role } from 'discord.js';
import { renderMessage } from '../renderMessage';

export const praiseRoleError = async (
  roles: Role[],
  user: User,
  host: string
): Promise<EmbedBuilder> => {
  const msg = await renderMessage(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    host,
    { user, roles }
  );

  return new EmbedBuilder().setColor('#ff0000').setDescription(msg);
};

export const praiseSuccessDM = async (
  praiseUrl: string,
  host: string,
  isActivated = true
): Promise<EmbedBuilder> => {
  const msg = await renderMessage('PRAISE_SUCCESS_DM', host, { praiseUrl });
  const embed = new EmbedBuilder().setColor('#696969').setDescription(msg);

  if (!isActivated) {
    const notActivatedMsg = await renderMessage(
      'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
      host
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
