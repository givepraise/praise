/* TODO - Replace db access with api2 calls */

import { GuildMember } from 'discord.js';
import { getReceiverData } from '../utils/getReceiverData';
import { getUserAccount } from '../utils/getUserAccount';
import { getUser } from '../utils/getUser';
import { praiseSuccessDM, renderMessage } from '../utils/embeds/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { praiseForwardEmbed } from '../utils/embeds/praiseForwardEmbed';
import { createForward } from '../utils/createForward';
import { getSetting } from '../utils/settingsUtil';
import { logger } from '../utils/logger';
import { getHost } from '../utils/getHost';

/**
 * Execute command /forward
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
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const host = await getHost(client, guild.id);

  if (host === undefined) {
    await interaction.editReply('This community is not registered for praise.');
    return;
  }

  if ((await assertPraiseAllowedInChannel(interaction, host)) === false) return;

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

  const forwarderUserId =
    typeof forwarderAccount.user === 'string'
      ? forwarderAccount.user
      : forwarderAccount.user._id;

  const forwarderUser = await getUser(forwarderUserId, host);
  if (!forwarderUser?.roles.includes('FORWARDER')) {
    await interaction.editReply(
      "**❌ You don't have the permission to use this command.**"
    );
    return;
  }

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;
  if (!praiseGiver) {
    await interaction.editReply('**❌ No Praise giver specified**');
    return;
  }

  if (!(await assertPraiseGiver(praiseGiver, interaction, true, host))) return;

  const reason = interaction.options.getString('reason');
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

    const praiseRegistered = await createForward(
      interaction,
      giverAccount,
      receiverAccount,
      forwarderAccount,
      reason,
      host
    );

    // await logEvent(
    //   EventLogTypeKey.PRAISE,
    //   'Created a new forwarded praise from discord',
    //   {
    //     userAccountId: forwarderAccount._id,
    //     userId: forwarderUser._id,
    //   }
    // );

    if (praiseRegistered) {
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

  if (Receivers.length !== 0 && receivers.length !== 0) {
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
  } else if (warnSelfPraise) {
    await interaction.editReply(
      await renderMessage('SELF_PRAISE_WARNING', host)
    );
  } else if (!Receivers.length) {
    await interaction.editReply(
      await renderMessage('PRAISE_INVALID_RECEIVERS_ERROR', host)
    );
  } else {
    await interaction.editReply('Praise Forward failed :(');
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
