import { SlashCommandBuilder } from '@discordjs/builders';
import { PraiseModel } from 'api/dist/praise/entities';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { CommandInteraction, Interaction, Message } from 'discord.js';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import {
  dmError,
  invalidReceiverError,
  missingReasonError,
  notActivatedDM,
  notActivatedError,
  praiseSuccess,
  praiseSuccessDM,
  roleError,
  roleMentionWarning,
  undefinedReceiverWarning,
} from '../utils/praiseEmbeds';

const praise = async (
  interaction: CommandInteraction,
  responseUrl: string
) => {
  const { guild, channel, member } = interaction;

  if (!guild || !member) {
    await interaction.editReply(dmError);
    return;
  }

  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === process.env.PRAISE_GIVER_ROLE_ID
  );
  const praiseGiver = await guild.members.fetch(member.user.id);

  if (
    praiseGiverRole &&
    !praiseGiver.roles.cache.find((r) => r.id === praiseGiverRole?.id)
  ) {
    await interaction.editReply({
      embeds: [roleError(praiseGiverRole, praiseGiver)],
    });

    return;
  }

  const ua = {
    accountId: member.user.id,
    name: member.user.username + '#' + member.user.discriminator,
    avatarId: member.user.avatar,
    platform: 'DISCORD',
  } as UserAccount;

  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: ua.accountId },
    ua,
    { upsert: true, new: true }
  );

  const receivers = interaction.options.getString('receivers');
  const reason = interaction.options.getString('reason');

  const receiverData = {
    validReceiverIds: receivers?.match(/<@!([0-9]+)>/g),
    undefinedReceivers: receivers?.match(/@([a-z0-9]+)/gi),
    roleMentions: receivers?.match(/<@&([0-9]+)>/g),
  };

  if (
    !receivers ||
    receivers.length === 0 ||
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length === 0
  ) {
    await interaction.editReply(invalidReceiverError);
    return;
  }

  if (!reason || reason.length === 0) {
    await interaction.editReply(missingReasonError);
    return;
  }

  if (!userAccount.user) {
    await interaction.editReply(notActivatedError);
    return;
  }

  const praised: string[] = [];
  const receiverIds = receiverData.validReceiverIds.map((id) =>
    id.substr(3, id.length - 4)
  );
  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  const guildChannel = await guild.channels.fetch(channel?.id || '');

  for (const receiver of Receivers) {
    const ra = {
      accountId: receiver.user.id,
      name: receiver.user.username + '#' + receiver.user.discriminator,
      avatarId: receiver.avatar,
      platform: 'DISCORD',
    } as UserAccount;
    const receiverAccount = await UserAccountModel.findOneAndUpdate(
      { accountId: ra.accountId },
      ra,
      { upsert: true, new: true }
    );

    if (!receiverAccount.user) {
      try {
        await receiver.send({ embeds: [notActivatedDM(responseUrl)] });
      } catch (err) {
        logger.warn(`Can't DM user - ${ra.name} [${ra.accountId}]`);
      }
    }
    const praiseObj = await PraiseModel.create({
      reason: reason,
      giver: userAccount._id,
      sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
      sourceName: `DISCORD:${encodeURI(guild.name)}:${encodeURI(
        guildChannel?.name || ''
      )}`,
      receiver: receiverAccount._id,
    });
    if (praiseObj) {
      await receiver.send({ embeds: [praiseSuccessDM(responseUrl)] });
      praised.push(ra.accountId);
    } else {
      logger.err(
        `Praise not registered for [${ua.accountId}] -> [${ra.accountId}] for [${reason}]`
      );
    }
  }

  const msg = (await interaction.editReply(
    praiseSuccess(
      praised.map((id) => `<@!${id}>`),
      reason
    )
  )) as Message;

  if (receiverData.undefinedReceivers) {
    await msg.reply(
      undefinedReceiverWarning(
        receiverData.undefinedReceivers.join(', '),
        ua.accountId
      )
    );
  }
  if (receiverData.roleMentions) {
    await msg.reply(
      roleMentionWarning(receiverData.roleMentions.join(', '), ua.accountId)
    );
  }

  return;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('praise')
    .setDescription('Praise a user')
    .addStringOption((option) =>
      option
        .setName('receivers')
        .setDescription(
          'Mention the users you would like to send this praice to'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason for this Praise')
        .setRequired(true)
    ),

  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'praise') {
        const msg = await interaction.deferReply({fetchReply: true}) as APIMessage | void;
        if (msg !== undefined) {
          msg as APIMessage;
          await praise(
            interaction,
            `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${msg?.id}`
          );
        }
      }
    }
  },
};
