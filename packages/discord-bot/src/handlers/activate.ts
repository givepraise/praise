import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { CommandInteraction } from 'discord.js';
import randomstring from 'randomstring';

export const activationHandler = async (
  interaction: CommandInteraction
): Promise<void> => {
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
  const server = process.env.SERVER;
  if (!server || server === undefined) {
    await interaction.reply(
      'ERROR: `SERVER` not defined in environment variables. Contact praise admin'
    );
    return;
  }
  const frontendUrl = `http://${
    process.env.NODE_ENV === 'production' ? server : `${server}:3000`
  }`; // Assume default craco port 3000 if not in production

  const getActivationURL = (
    accountId: string,
    uname: string,
    hash: string,
    token: string
  ): string =>
    `${frontendUrl}/activate?accountId=${accountId}&accountName=${encodeURIComponent(
      `${uname}#${hash}`
    )}&platform=DISCORD&token=${token}`;

  const activationURL = getActivationURL(
    ua.accountId,
    user.username,
    user.discriminator,
    ua.activateToken || 'undefined'
  );

  await interaction.reply({
    content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
    ephemeral: true,
  });
};
