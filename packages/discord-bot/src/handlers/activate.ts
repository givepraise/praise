//import { EventLogTypeKey } from 'api/dist/eventlog/types';
//import { logEvent } from 'api/dist/eventlog/utils';
//import { Types } from 'mongoose';

import { CommandHandler } from '../interfaces/CommandHandler';
import { alreadyActivatedError } from '../utils/embeds/praiseEmbeds';
import { getUserAccount } from '../utils/getUserAccount';
import { dmError } from '../utils/embeds/praiseEmbeds';
import { GuildMember } from 'discord.js';
import { getActivateToken } from '../utils/getActivateToken';

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
    const userAccount = await getUserAccount(
      (member as GuildMember).user,
      guild.id
    );

    if (
      userAccount.user &&
      userAccount.user != null &&
      userAccount.user != ''
    ) {
      await interaction.reply({
        content: await alreadyActivatedError(guild.id),
        ephemeral: true,
      });
      return;
    }

    // await logEvent(
    //   EventLogTypeKey.AUTHENTICATION,
    //   'Ran the /activate command on discord',
    //   {
    //     userAccountId: new Types.ObjectId(userAccount._id),
    //   }
    // );

    const activateToken = await getActivateToken(userAccount, guild.id);

    const activationURL = `${
      process.env.FRONTEND_URL as string
    }/activate?accountId=${
      member.user.id
    }&platform=DISCORD&token=${activateToken}`;

    await interaction.reply({
      content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: 'Unable to activate user account.',
      ephemeral: true,
    });
  }
};
