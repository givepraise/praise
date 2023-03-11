//import { UserAccountModel } from 'api/dist/useraccount/entities';
//import { EventLogTypeKey } from 'api/dist/eventlog/types';
//import { logEvent } from 'api/dist/eventlog/utils';
import randomstring from 'randomstring';
import { CommandHandler } from '../interfaces/CommandHandler';
import { alreadyActivatedError } from '../utils/embeds/praiseEmbeds';
import { getUserAccount } from '../utils/getUserAccount';
//import { Types } from 'mongoose';
import { apiClient } from '../utils/api';
import { dmError } from '../utils/embeds/praiseEmbeds';
import { GuildMember } from 'discord.js';

/**
 * Executes command /activate
 *  Creates a one-time link on the Praise frontend linking to the activate page
 *  where the user can associate their Discord user with a UserAccount
 *
 * @param  interaction
 * @returns
 */
export const activationHandler: CommandHandler = async (interaction) => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await dmError());
    return;
  }

  try {
    const userAccount = await getUserAccount((member as GuildMember).user);

    if (
      userAccount.user &&
      userAccount.user != null &&
      userAccount.user != ''
    ) {
      await interaction.reply({
        content: await alreadyActivatedError(),
        ephemeral: true,
      });
      return;
    }

    const ua = {
      accountId: member.user.id,
      name: member.user.username + '#' + member.user.discriminator,
      avatarId: member.user.avatar,
      activateToken: randomstring.generate(),
    };

    await apiClient.patch(`/useraccounts/${userAccount._id}`, ua);

    // await logEvent(
    //   EventLogTypeKey.AUTHENTICATION,
    //   'Ran the /activate command on discord',
    //   {
    //     userAccountId: new Types.ObjectId(userAccount._id),
    //   }
    // );

    const getActivationURL = (
      accountId: string,
      uname: string,
      hash: string,
      token: string
    ): string =>
      `${
        process.env.FRONTEND_URL as string
      }/activate?accountId=${accountId}&accountName=${encodeURIComponent(
        `${uname}#${hash}`
      )}&platform=DISCORD&token=${token}`;

    const activationURL = getActivationURL(
      member.user.id,
      member.user.username,
      member.user.discriminator,
      ua.activateToken
    );

    await interaction.reply({
      content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
      ephemeral: true,
    });
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: 'Unable to create user account.',
      ephemeral: true,
    });
  }
};
