import { SlashCommandBuilder } from '@discordjs/builders';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { CommandInteraction, Interaction } from 'discord.js';
import randomstring from 'randomstring';

const activate = async (
  interaction: CommandInteraction
): Promise<CommandInteraction | undefined> => {
  const { user } = interaction;
  const ua = {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    avatarId: user.avatar,
    platform: 'DISCORD',
    activateToken: randomstring.generate(),
  } as UserAccount;
  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: user.id },
    ua,
    { upsert: true, new: true }
  );

  if (!userAccount) {
    await interaction.reply('Unable to create user account.');
    return;
  }

  await interaction.reply({
    content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${process.env.FRONTEND_URL}/activate?accountId=${ua.accountId}&accountName=${user.username}%23${user.discriminator}&platform=DISCORD&token=${ua.activateToken})`,
    ephemeral: true,
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('praise-activate')
    .setDescription(
      'Activates your praise account and links your eth address!'
    ),

  async execute(interaction: Interaction) {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'praise-activate') {
        await activate(interaction);
      }
    }
  },
};
