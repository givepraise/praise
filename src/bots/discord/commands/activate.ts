import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction } from 'discord.js';
import randomstring from 'randomstring';
import UserAccountModel from '../../../entities/UserAccount';

const activate = async (interaction: CommandInteraction) => {
  const { user } = interaction;
  const ua = {
    id: user.id,
    username: user.username + '#' + user.discriminator,
    profileImageUrl: user.avatar,
    platform: 'DISCORD',
    activateToken: randomstring.generate(),
  };

  const userAccount = await UserAccountModel.findOneAndUpdate(
    { username: ua.username },
    ua,
    { upsert: true, new: true }
  );

  if (!userAccount) {
    await interaction.reply('Unable to create user account.');
    return;
  }

  await interaction.reply(
    `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${process.env.FRONTEND_URL}/activate?account=${user.username}%23${user.discriminator}&platform=DISCORD&token=${ua.activateToken})`
  );
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('praise')
    .setDescription('The Praise Bot!')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('activate')
        .setDescription(
          'Activates your praise account and links your eth address!'
        )
    ),

  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      if (interaction.options.getSubcommand() === 'activate') {
        await activate(interaction);
      }
    }
  },
};
