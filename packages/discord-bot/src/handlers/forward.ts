import { GuildMember, User } from 'discord.js';
import { parseReceivers } from '../utils/parseReceivers';
import { getUserAccount } from '../utils/getUserAccount';
import { getUser } from '../utils/getUser';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { praiseForwardEmbed } from '../utils/embeds/praiseForwardEmbed';
import { createForward } from '../utils/createForward';
import { getSetting } from '../utils/settingsUtil';
import { logger } from '../utils/logger';
import { renderMessage, ephemeralWarning } from '../utils/renderMessage';
import { UserAccount, Praise } from '../utils/api-schema';
import { sendReceiverDM } from '../utils/embeds/sendReceiverDM';

/**
 * Execute command /forward
 *  Creates praises with a given giver, receiver, and reason
 *
 */
export const forwardHandler: CommandHandler = async (
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
    if ((await assertPraiseAllowedInChannel(interaction, host)) === false)
      return;

    const forwarderAccount = await getUserAccount(
      (member as GuildMember).user,
      host
    );
    if (!forwarderAccount.user) {
      await ephemeralWarning(
        interaction,
        'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
        host
      );
      return;
    }

    const forwarderUserId =
      typeof forwarderAccount.user === 'string'
        ? forwarderAccount.user
        : forwarderAccount.user._id;

    const forwarderUser = await getUser(forwarderUserId, host);
    if (!forwarderUser?.roles.includes('FORWARDER')) {
      await ephemeralWarning(interaction, 'FORWARDER_ROLE_WARNING', host);
      return;
    }

    const praiseGiver = interaction.options.getMember('giver') as GuildMember;

    if (!(await assertPraiseGiver(praiseGiver, interaction, true, host)))
      return;

    const reason = interaction.options.getString('reason');
    if (!reason || reason.length === 0) {
      await ephemeralWarning(interaction, 'PRAISE_REASON_MISSING_ERROR', host);
      return;
    }

    if (reason.length < 5 || reason.length > 280) {
      await ephemeralWarning(interaction, 'INVALID_REASON_LENGTH', host);
      return;
    }

    const receiverOptions = interaction.options.getString('receivers');

    if (!receiverOptions || receiverOptions.length === 0) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
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
    const giverAccount = await getUserAccount(praiseGiver.user, host);
    if (!giverAccount.user) {
      await ephemeralWarning(
        interaction,
        'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
        host,
        {
          praiseGiver: praiseGiver.user,
        }
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

    let praiseItems: Praise[] = [];

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

    praiseItems = await createForward(
      interaction,
      giverAccount,
      receivers.map((receiver) => receiver.userAccount),
      forwarderAccount,
      reason,
      host
    );

    if (receivers.length !== 0) {
      await interaction.editReply({
        embeds: [
          await praiseForwardEmbed(
            interaction,
            praiseGiver.user,
            receivers.map((receiver) => `<@!${receiver.guildMember.id}>`),
            reason,
            host
          ),
        ],
      });
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
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(`(forward) ${(err as any).message as string}`);
    throw err;
  }
};
