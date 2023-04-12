/* TODO - Replace db access with api2 calls */

import { GuildMember } from 'discord.js';
import { getReceiverData } from '../utils/getReceiverData';
import { getUserAccount } from '../utils/getUserAccount';
import { getUser } from '../utils/getUser';
import { dmError, praiseSuccessDM } from '../utils/embeds/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { praiseForwardEmbed } from '../utils/embeds/praiseForwardEmbed';
import { createForward } from '../utils/createForward';
import { apiClient } from '../utils/api';
import { logger } from '../utils/logger';
import { getHost } from '../utils/getHost';
import { renderMessage } from '../utils/embeds/praiseEmbeds';

/**
 * Execute command /firward
 *  Creates praises with a given giver, receiver, and reason
 *
 * @param  interaction
 * @param  responseUrl
 * @returns
 */
export const forwardHandler: CommandHandler = async (
  client,
  interaction,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(dmError);
    return;
  }

  const host = await getHost(client, guild.id);

  if (host === undefined) {
    await interaction.editReply('This community is not registered for praise.');
    return;
  }

  const forwarderAccount = await getUserAccount(
    (member as GuildMember).user,
    host
  );
  if (!forwarderAccount.user) {
    await interaction.editReply(
      await renderMessage('PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR', host)
    );
    return;
  }

  const forwarderUser = await getUser(forwarderAccount.user as string, host);
  if (!forwarderUser?.roles.includes('FORWARDER')) {
    await interaction.editReply(
      "**❌ You don't have the permission to use this command.**"
    );
    return;
  }

  if ((await assertPraiseAllowedInChannel(interaction)) === false) return;

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;
  if (!praiseGiver) {
    await interaction.editReply('**❌ No Praise giver specified**');
    return;
  }

  if (!(await assertPraiseGiver(praiseGiver, interaction, true))) return;

  const receiverOptions = interaction.options.getString('receivers');

  if (!receiverOptions || receiverOptions.length === 0) {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
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

  const reason = interaction.options.getString('reason');
  if (!reason || reason.length === 0) {
    await interaction.editReply(
      await renderMessage('PRAISE_REASON_MISSING_ERROR', host)
    );
    return;
  }

  const giverAccount = await getUserAccount(praiseGiver.user, host);
  if (!giverAccount.user) {
    await interaction.editReply(
      await renderMessage('FORWARD_FROM_UNACTIVATED_GIVER_ERROR', host, {
        praiseGiver: praiseGiver.user,
      })
    );
    return;
  }

  const receivers: string[] = [];
  const receiverIds = [
    ...new Set(
      receiverData.validReceiverIds.map((id: string) => id.replace(/\D/g, ''))
    ),
  ];

  const selfPraiseAllowed = await apiClient
    .get('/settings?key=SELF_PRAISE_ALLOWED')
    .then((res) => res.data)
    .catch(() => false);

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

    const praiseObj = await createForward(
      interaction,
      giverAccount,
      receiverAccount,
      forwarderAccount,
      reason
    );

    // await logEvent(
    //   EventLogTypeKey.PRAISE,
    //   'Created a new forwarded praise from discord',
    //   {
    //     userAccountId: forwarderAccount._id,
    //     userId: forwarderUser._id,
    //   }
    // );

    if (praiseObj) {
      try {
        await receiver.send({
          embeds: [
            await praiseSuccessDM(responseUrl, !receiverAccount.user, host),
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

  if (Receivers.length !== 0) {
    await interaction.editReply('Praise forwarded!');
    await interaction.followUp({
      embeds: [
        await praiseForwardEmbed(
          interaction,
          praiseGiver.user,
          receivers.map((id) => `<@!${id}>`),
          reason,
          host
        ),
      ],
      ephemeral: false,
    });
    await interaction.followUp({
      content: await renderMessage('FORWARD_SUCCESS_MESSAGE', host, {
        reason: reason,
        praiseGiver: praiseGiver.user,
        receivers: receivers.map((id) => `<@!${id}>`),
      }),
      ephemeral: false,
    });
  } else if (warnSelfPraise) {
    await interaction.editReply(
      await renderMessage('SELF_PRAISE_WARNING', host)
    );
  } else {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
    );
  }

  const warningMsg =
    (receiverData.undefinedReceivers
      ? (await renderMessage('PRAISE_UNDEFINED_RECEIVERS_WARNING', host, {
          receivers: receiverData.undefinedReceivers,
          user: praiseGiver.user,
        })) + '\n'
      : '') +
    (receiverData.roleMentions
      ? (await renderMessage('PRAISE_TO_ROLE_WARNING', host, {
          user: praiseGiver.user,
          receivers: receiverData.roleMentions,
        })) + '\n'
      : '') +
    (Receivers.length !== 0 && warnSelfPraise
      ? (await renderMessage('SELF_PRAISE_WARNING', host)) + '\n'
      : '');

  if (warningMsg && warningMsg.length !== 0) {
    await interaction.followUp({ content: warningMsg, ephemeral: true });
  }
};
