import { GuildMember, User } from 'discord.js';
import { getReceiverData } from '../utils/getReceiverData';
import { praiseSuccessDM, renderMessage } from '../utils/embeds/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';
import { createPraise } from '../utils/createPraise';
import { praiseSuccessEmbed } from '../utils/embeds/praiseSuccessEmbed';
import { apiClient } from '../utils/api';
import { PraiseItem } from '../utils/api-schema';
import { getSetting } from '../utils/settingsUtil';
import { getHost } from '../utils/getHost';

import { logger } from '../utils/logger';
/**
 * Execute command /praise
 *  Creates praises with a given receiver and reason
 *  with the command executor as the praise.giver
 *
 * @param  interaction
 * @param  responseUrl
 * @returns
 */
export const praiseHandler: CommandHandler = async (
  client,
  interaction,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, channel, member } = interaction;

  if (!guild || !member || !channel) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const host = await getHost(client, guild.id);

  if (host === undefined) {
    await interaction.editReply('This community is not registered for praise.');
    return;
  }

  if (
    !(await assertPraiseGiver(member as GuildMember, interaction, true, host))
  )
    return;
  if (!(await assertPraiseAllowedInChannel(interaction, host))) return;

  const receiverOptions = interaction.options.getString('receivers');

  if (!receiverOptions || receiverOptions.length === 0) {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
    );
    return;
  }

  const reason = interaction.options.getString('reason', true);
  if (!reason || reason.length === 0) {
    await interaction.editReply(
      await renderMessage('PRAISE_REASON_MISSING_ERROR', host)
    );
    return;
  }

  if (reason.length < 5 || reason.length > 280) {
    await interaction.editReply(
      'INVALID_REASON_LENGTH (reason should be between 5 to 280 characters)'
    );
    return;
  }

  const receiverData = getReceiverData(receiverOptions);

  if (
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length === 0
  ) {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
    );
    return;
  }

  const giverAccount = await getUserAccount((member as GuildMember).user, host);

  if (!giverAccount || !giverAccount.user || giverAccount.user === null) {
    await interaction.editReply(
      await renderMessage('PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR', host)
    );
    return;
  }

  const praiseItemsCount = await apiClient
    .get(`/praise?limit=1&giver=${giverAccount._id}`, {
      headers: { host },
    })
    .then((res) => (res.data as PraiseItem).totalPages)
    .catch(() => 0);

  const receivers: string[] = [];
  const receiverIds: string[] = [
    ...new Set(
      receiverData.validReceiverIds.map((id: string) => id.replace(/\D/g, ''))
    ),
  ];

  const selfPraiseAllowed = (await getSetting(
    'SELF_PRAISE_ALLOWED',
    host
  )) as boolean;

  let warnSelfPraise = false;
  if (!selfPraiseAllowed && receiverIds.includes(giverAccount.accountId)) {
    warnSelfPraise = true;
    receiverIds.splice(receiverIds.indexOf(giverAccount.accountId), 1);
  }

  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  for (const receiver of Receivers) {
    const receiverAccount = await getUserAccount(receiver.user, host);

    const praiseRegistered = await createPraise(
      interaction,
      giverAccount,
      receiverAccount,
      reason,
      host
    );

    if (praiseRegistered) {
      // await logEvent(
      //   EventLogTypeKey.PRAISE,
      //   'Created a new praise from discord',
      //   {
      //     userAccountId: new Types.ObjectId(giverAccount._id),
      //   }
      // );

      try {
        await receiver.send({
          embeds: [
            await praiseSuccessDM(
              responseUrl,
              receiverAccount.user ? true : false,
              host
            ),
          ],
        });
      } catch (err) {
        logger.warn(
          `Can't DM user - ${receiverAccount.name} [${receiverAccount.accountId}]`
        );
      }
      receivers.push(receiverAccount.accountId);
    } else {
      logger.error(
        `Praise not registered for [${giverAccount.accountId}] -> [${receiverAccount.accountId}] for [${reason}]`
      );
    }
  }

  if (Receivers.length !== 0 && receivers.length !== 0) {
    await interaction.editReply('Praise given!');
    await interaction.followUp({
      embeds: [
        await praiseSuccessEmbed(
          interaction.user,
          receivers.map((id) => `<@!${id}>`),
          reason,
          host
        ),
      ],
      ephemeral: false,
    });
    await interaction.followUp({
      content: await renderMessage('PRAISE_SUCCESS_MESSAGE', host, {
        receivers: receivers.map((id) => `<@!${id}>`),
        reason: reason,
      }),
      ephemeral: false,
    });
  } else if (warnSelfPraise) {
    await interaction.editReply(
      await renderMessage('SELF_PRAISE_WARNING', host)
    );
  } else if (!Receivers.length) {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
    );
  } else {
    await interaction.editReply('Praise failed :(');
  }

  const warningMsg =
    (receiverData.undefinedReceivers
      ? (await renderMessage('PRAISE_UNDEFINED_RECEIVERS_WARNING', host, {
          receivers: receiverData.undefinedReceivers.map((id) =>
            id.replace(/[<>]/, '')
          ),
          user: member.user as User,
        })) + '\n'
      : '') +
    (receiverData.roleMentions
      ? (await renderMessage('PRAISE_TO_ROLE_WARNING', host, {
          user: member.user as User,
          receivers: receiverData.roleMentions,
        })) + '\n'
      : '') +
    (Receivers.length !== 0 && warnSelfPraise
      ? (await renderMessage('SELF_PRAISE_WARNING', host)) + '\n'
      : '');

  if (warningMsg && warningMsg.length !== 0) {
    await interaction.followUp({ content: warningMsg, ephemeral: true });
  }

  if (
    receivers.length &&
    receiverOptions.length &&
    receiverOptions.length !== 0 &&
    praiseItemsCount === 0
  ) {
    await interaction.followUp({
      content: await renderMessage('FIRST_TIME_PRAISER', host),
      ephemeral: true,
    });
  }
};
