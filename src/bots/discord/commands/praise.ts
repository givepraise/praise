import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { praiseErrorEmbed, praiseSuccessEmbed } from '../utils/praiseEmbeds'

import randomstring from 'randomstring';

import UserAccountModel from '../../../entities/UserAccount';
import UserModel from '../../../entities/User';
import PraiseModel from '../../../entities/Praise';

const praise = async (interaction: CommandInteraction) => {
  const { guild, channel, member } = interaction;
  if (!guild || !member) {
    const dmErrorEmbed = praiseErrorEmbed(
      'Server not found',
      'This command can only be used in the discord server.'
    );
    await interaction.reply({ embeds: [dmErrorEmbed] });
    return;
  }

  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === process.env.PRAISE_GIVER_ROLE_ID
  );
  const praiseGiver = await guild.members.fetch(member.user.id);

  if (!praiseGiver.roles.cache.find((r) => r.id === praiseGiverRole?.id)) {
    const noGiverRoleEmbed = praiseErrorEmbed(
      `User does not have \`${praiseGiverRole?.name}\` role`,
      `The praise command can only be used by members with the <@&${praiseGiverRole?.id}> role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.`
    );
    await interaction.reply({ embeds: [noGiverRoleEmbed] });
    return;
  }

  const ua = {
    id: member.user.id,
    username: member.user.username + '#' + member.user.discriminator,
    profileImageUrl: member.user.avatar,
    platform: 'DISCORD',
  };

  const userAccount = await UserAccountModel.findOneAndUpdate(
    { id: ua.id },
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

  const addInfoFields = (embed: MessageEmbed) => {
    embed.addField(
      'Valid Receivers',
      receiverData.validReceiverIds?.join(', ') || 'No Receivers Mentioned.'
    );
    if (receiverData.undefinedReceivers) {
      embed.addField(
        'Undefined Receivers',
        (receiverData.undefinedReceivers?.join(', ') || '') +
          "\nThese users don't exist in the system, and hence can't be praised."
      );
    }
    if (receiverData.roleMentions) {
      embed.addField(
        'Roles Mentioned',
        (receiverData.roleMentions?.join(', ') || '') +
          "\nYou can't dish praise to entire roles."
      );
    }
    embed.addField('Reason', reason || 'No reason entered.');
    return embed;
  };

  if (
    !receivers ||
    receivers.length == 0 ||
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length == 0
  ) {
    const noReceiverEmbed = praiseErrorEmbed(
      'Receivers not mentiond',
      'This command requires atleast one valid receiver to be mentioned.'
    );

    await interaction.reply({ embeds: [addInfoFields(noReceiverEmbed)] });
    return;
  }

  if (!reason || reason.length == 0) {
    const noReasonEmbed = praiseErrorEmbed(
      'Reason not provided',
      'Praise needs a `reason` in order to be dished.'
    );
    await interaction.reply({ embeds: [addInfoFields(noReasonEmbed)] });
    return;
  }

  const User = await UserModel.findOne({
    accounts: userAccount,
  });

  if (!User) {
    const notActivatedEmbed = praiseErrorEmbed(
      'Account Not Activated',
      'Your Account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.'
    );
    await interaction.reply({ embeds: [addInfoFields(notActivatedEmbed)] });
    return;
  }

  const praised: string[] = [];
  const receiverIds = receiverData.validReceiverIds.map((id) =>
    id.substr(3, id.length - 4)
  );
  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  const guildChannel = await guild.channels.fetch(
    interaction?.channel?.id || ''
  );

  for (const receiver of Receivers) {
    const ra = {
      id: receiver.user.id,
      username: receiver.user.username + '#' + receiver.user.discriminator,
      profileImageUrl: receiver.avatar,
      platform: 'DISCORD',
    };
    const receiverAccount = await UserAccountModel.findOneAndUpdate(
      { id: ra.id },
      ra,
      { upsert: true, new: true }
    );

    const receiverUser = await UserModel.findOne({
      accounts: receiverAccount,
    });
    if (!receiverUser) {
      await receiver.send(
        "You were just praised in the TEC! It looks like you haven't activated your account... To activate use the `/praise-activate` command in the server."
      );
    }

    await PraiseModel.create({
      reason: reason,
      giver: userAccount!._id,
      sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
      sourceName: `DISCORD:${encodeURI(guild.name)}:${encodeURI(
        guildChannel?.name || ''
      )}`,
      receiver: receiverAccount!._id,
    });
    praised.push(ra.id);
  }

  await interaction.reply({
    embeds: [praiseSuccessEmbed(praised.map((id) => `<@!${id}>`), reason)],
  });
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
        await praise(interaction);
      }
    }
  },
};
