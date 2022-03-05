import { SlashCommandBuilder } from '@discordjs/builders';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { CommandInteraction, Interaction } from 'discord.js';
import randomstring from 'randomstring';

const activate = async (interaction: CommandInteraction): Promise<void> => {
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
  const baseURL = process.env.FRONTEND_URL;
  if (!baseURL || baseURL === undefined) {
    await interaction.reply(
      'ERROR: `FRONTEND_URL` not defined in environment variables. Contact praise admin'
    );
    return;
  }

  const getActivationURL = (
    accountId: string,
    uname: string,
    hash: string,
    token: string
  ): string =>
    `${baseURL}/activate?accountId=${accountId}&accountName=${uname}/#${hash}&platform=DISCORD&token=${token}`;

  const activationURL = encodeURI(
    getActivationURL(
      ua.accountId,
      user.username,
      user.discriminator,
      ua.activateToken || 'undefined'
    )
  );

  await interaction.reply({
    content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${encodeURI(
      activationURL
    )}})`,
    ephemeral: true,
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('praise-activate')
    .setDescription(
      'Activates your praise account and links your eth address!'
    ),

  async execute(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'praise-activate') {
        await activate(interaction);
      }
    }
  },
};
