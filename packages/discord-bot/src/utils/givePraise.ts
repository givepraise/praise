import { getUserAccount } from './getUserAccount';
import { sendReceiverDM } from '../utils/embeds/sendReceiverDM';
import { getSetting } from '../utils/settingsUtil';
import { createPraise } from '../utils/createPraise';
import { praiseSuccessEmbed } from '../utils/embeds/praiseSuccessEmbed';
import { apiClient } from '../utils/api';
import {
  PraisePaginatedResponseDto,
  UserAccount,
  Praise,
} from '../utils/api-schema';
import { renderMessage, ephemeralWarning } from './renderMessage';
import { ParsedReceivers } from './parseReceivers';
import { ChatInputCommandInteraction, Guild, GuildMember } from 'discord.js';

export const givePraise = async (
  interaction: ChatInputCommandInteraction,
  guild: Guild,
  member: GuildMember,
  giverAccount: UserAccount,
  parsedReceivers: ParsedReceivers,
  receiverOptions: string,
  reason: string,
  host: string,
  responseUrl: string,
  score?: number
): Promise<void> => {
  if (
    !parsedReceivers.validReceiverIds ||
    parsedReceivers.validReceiverIds?.length === 0
  ) {
    await ephemeralWarning(interaction, 'PRAISE_INVALID_RECEIVERS_ERROR', host);
    return;
  }
  const validReceiverIds: string[] = [
    ...new Set(
      parsedReceivers.validReceiverIds.map((id: string) =>
        id.replace(/\D/g, '')
      )
    ),
  ];

  const selfPraiseAllowed = (await getSetting(
    'SELF_PRAISE_ALLOWED',
    host
  )) as boolean;

  let warnSelfPraise = false;
  if (!selfPraiseAllowed && validReceiverIds.includes(giverAccount.accountId)) {
    warnSelfPraise = true;
    validReceiverIds.splice(
      validReceiverIds.indexOf(giverAccount.accountId),
      1
    );
  }

  const receivers: {
    guildMember: GuildMember;
    userAccount: UserAccount;
  }[] = await Promise.all(
    (
      await guild.members.fetch({ user: validReceiverIds })
    ).map(async (guildMember) => {
      const userAccount = await getUserAccount(guildMember.user, host);
      return {
        guildMember,
        userAccount,
      };
    })
  );

  let praiseItems: Praise[] = [];
  if (receivers.length !== 0) {
    await interaction.editReply({
      content: '',
      embeds: [
        await praiseSuccessEmbed(
          interaction.user,
          validReceiverIds.map((id) => `<@!${id}>`),
          reason,
          host
        ),
      ],
      components: [],
    });

    praiseItems = await createPraise(
      interaction,
      giverAccount,
      receivers.map((receiver) => receiver.userAccount),
      reason,
      host,
      score
    );
  } else if (warnSelfPraise) {
    await ephemeralWarning(interaction, 'SELF_PRAISE_WARNING', host);
  } else if (!receivers.length) {
    await ephemeralWarning(interaction, 'PRAISE_INVALID_RECEIVERS_ERROR', host);
  } else {
    await ephemeralWarning(interaction, 'PRAISE_FAILED', host);
  }

  const hostUrl =
    process.env.NODE_ENV === 'development'
      ? process.env?.FRONTEND_URL || 'undefined:/'
      : `https://${host}`;

  const praiseNotificationsEnabled = (await getSetting(
    'DISCORD_BOT_PRAISE_NOTIFICATIONS_ENABLED',
    host
  )) as boolean;

  if (praiseNotificationsEnabled) {
    await Promise.all(
      praiseItems.map(async (praise) => {
        await sendReceiverDM(
          praise._id,
          receivers.filter(
            (receiver) =>
              receiver.userAccount.accountId === praise.receiver.accountId
          )[0],
          member,
          reason,
          responseUrl,
          host,
          hostUrl,
          interaction.channelId
        );
      })
    );
  }

  const warningMsgParts: string[] = [];

  if (parsedReceivers.undefinedReceivers) {
    const warning = await renderMessage('', host, {
      receivers: parsedReceivers.undefinedReceivers.map((id) =>
        id.replace(/[<>]/, '')
      ),
      user: member.user,
    });
    warningMsgParts.push(warning);
  }

  if (parsedReceivers.roleMentions) {
    const warning = await renderMessage('PRAISE_TO_ROLE_WARNING', host, {
      user: member.user,
      receivers: parsedReceivers.roleMentions,
    });
    warningMsgParts.push(warning);
  }

  if (receivers.length !== 0 && warnSelfPraise) {
    const warning = await renderMessage('SELF_PRAISE_WARNING', host);
    warningMsgParts.push(warning);
  }

  const warningMsg = warningMsgParts.join('\n');

  if (warningMsg && warningMsg.length !== 0) {
    await interaction.followUp({ content: warningMsg, ephemeral: true });
  }

  const praiseItemsCount = await apiClient
    .get(`/praise?limit=1&giver=${giverAccount._id}`, {
      headers: { host },
    })
    .then((res) => (res.data as PraisePaginatedResponseDto).totalPages)
    .catch(() => 0);

  if (receivers.length && receiverOptions.length && praiseItemsCount === 0) {
    await interaction.followUp({
      content: await renderMessage('FIRST_TIME_PRAISER', host),
      ephemeral: true,
    });
  }
};
