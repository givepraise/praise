import { GuildMember, User } from 'discord.js';
import { parseReceivers } from '../utils/parseReceivers';
import { sendReceiverDM } from '../utils/embeds/sendReceiverDM';
import { renderMessage, ephemeralWarning } from '../utils/renderMessage';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';
import { createPraise } from '../utils/createPraise';
import { praiseSuccessEmbed } from '../utils/embeds/praiseSuccessEmbed';
import { apiClient } from '../utils/api';
import { PraisePaginatedResponseDto, UserAccount } from '../utils/api-schema';
import { getSetting } from '../utils/settingsUtil';
import { logger } from '../utils/logger';
import { Praise } from '../utils/api-schema';

/**
 * Execute command /praise
 *  Creates praises with a given receiver and reason
 *  with the command executor as the praise.giver
 *
 */
export const praiseHandler: CommandHandler = async (
  client,
  interaction,
  host,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, member } = interaction;

  if (!guild || !member) {
    await ephemeralWarning(interaction, 'DM_ERROR');
    return;
  }

  try {
    if (
      !(await assertPraiseGiver(member as GuildMember, interaction, true, host))
    )
      return;
    if (!(await assertPraiseAllowedInChannel(interaction, host))) return;

    const receiverOptions = interaction.options.getString('receivers');

    if (!receiverOptions || receiverOptions.length === 0) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
      return;
    }

    const reason = interaction.options.getString('reason', true);

    if (reason.length < 5 || reason.length > 280) {
      await ephemeralWarning(interaction, 'INVALID_REASON_LENGTH', host);
      return;
    }

    const parsedReceivers = parseReceivers(receiverOptions);

    if (
      !parsedReceivers.validReceiverIds ||
      parsedReceivers.validReceiverIds?.length === 0
    ) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
      return;
    }

    const giverAccount = await getUserAccount(
      (member as GuildMember).user,
      host
    );

    if (!giverAccount || !giverAccount.user || giverAccount.user === null) {
      await ephemeralWarning(
        interaction,
        'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
        host
      );
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
    if (
      !selfPraiseAllowed &&
      validReceiverIds.includes(giverAccount.accountId)
    ) {
      warnSelfPraise = true;
      validReceiverIds.splice(
        validReceiverIds.indexOf(giverAccount.accountId),
        1
      );
    }

    const receivers: { guildMember: GuildMember; userAccount: UserAccount }[] =
      await Promise.all(
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
        embeds: [
          await praiseSuccessEmbed(
            interaction.user,
            validReceiverIds.map((id) => `<@!${id}>`),
            reason,
            host
          ),
        ],
      });
      praiseItems = await createPraise(
        interaction,
        giverAccount,
        receivers.map((receiver) => receiver.userAccount),
        reason,
        host
      );
    } else if (warnSelfPraise) {
      await ephemeralWarning(interaction, 'SELF_PRAISE_WARNING', host);
    } else if (!receivers.length) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
    } else {
      await ephemeralWarning(interaction, 'PRAISE_FAILED', host);
    }

    const hostUrl =
      process.env.NODE_ENV === 'development'
        ? process.env?.FRONTEND_URL || 'undefined:/'
        : `https://${host}`;

    await Promise.all(
      praiseItems.map(async (praise) => {
        console.log(praiseItems, receivers);
        await sendReceiverDM(
          praise._id,
          receivers.filter(
            (receiver) =>
              receiver.userAccount.accountId === praise.receiver.accountId
          )[0],
          member as GuildMember,
          reason,
          responseUrl,
          host,
          hostUrl,
          interaction.channelId
        );
      })
    );

    const warningMsgParts: string[] = [];

    if (parsedReceivers.undefinedReceivers) {
      const warning = await renderMessage(
        'PRAISE_UNDEFINED_RECEIVERS_WARNING',
        host,
        {
          receivers: parsedReceivers.undefinedReceivers.map((id) =>
            id.replace(/[<>]/, '')
          ),
          user: member.user as User,
        }
      );
      warningMsgParts.push(warning);
    }

    if (parsedReceivers.roleMentions) {
      const warning = await renderMessage('PRAISE_TO_ROLE_WARNING', host, {
        user: member.user as User,
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
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(`(praise) ${(err as any).message as string}`);
    throw err;
  }
};
