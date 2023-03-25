import { PeriodModel } from 'api/dist/period/entities';
import { UserModel } from 'api/dist/user/entities';
import { UserRole, UserDocument } from 'api/dist/user/types';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { getPreviousPeriodEndDate } from 'api/dist/period/utils/core';
import {
  PeriodDocument,
  PeriodDetailsQuantifierDto,
} from 'api/dist/period/types';

import { CommandInteraction, DiscordAPIError } from 'discord.js';
import { PraiseModel } from 'api/dist/praise/entities';
import { Buffer } from 'node:buffer';
import { FailedToDmUsersList } from '../interfaces/FailedToDmUsersList';

/**
 * Send a custom direct message to a list of users
 *
 * @param {CommandInteraction} interaction
 * @param {(UserDocument[] | PeriodDetailsQuantifierDto[])} users
 * @param {string} message
 * @returns {Promise<void>}
 */
const sendDMs = async (
  interaction: CommandInteraction,
  users: UserDocument[] | PeriodDetailsQuantifierDto[],
  message: string
): Promise<void> => {
  const successful = [];
  const failed: FailedToDmUsersList = {
    invalidUsers: <string[]>[],
    notFoundUsers: <string[]>[],
    closedDmUsers: <string[]>[],
    unknownErrorUsers: <string[]>[],
  };
  if (!users || users.length === 0) {
    await interaction.editReply(
      'Message not sent. No recipients matched filter.'
    );
  }

  for (const user of users) {
    const userAccount = await UserAccountModel.findOne({
      user: user._id,
    });
    const userId: string = userAccount?.accountId || 'Unknown user';
    const userName: string = userAccount?.name || userId;
    try {
      const discordUser = await interaction.guild?.members.fetch(userId);
      if (!discordUser) {
        failed.notFoundUsers.push(userAccount?.name || userId);
        continue;
      }
      await discordUser.send(message);
      successful.push(`${discordUser.user.tag}`);
    } catch (err) {
      const error = err as Error;
      if (error instanceof DiscordAPIError) {
        /* The numbers used below are status codes from discord's API.
         * (ref - https://discord.com/developers/docs/topics/opcodes-and-status-codes#json)
         */
        const discordErrorCode = (err as DiscordAPIError).code;
        switch (discordErrorCode) {
          case 50035:
            failed.invalidUsers.push(userName);
            break;
          case 50007:
            failed.closedDmUsers.push(userName);
            break;
          default:
            failed.unknownErrorUsers.push(userAccount?.name || userId);
            break;
        }
      } else {
        failed.unknownErrorUsers.push(userAccount?.name || userId);
      }
    }
  }

  const failedCount =
    failed.invalidUsers.length +
    failed.notFoundUsers.length +
    failed.closedDmUsers.length +
    failed.unknownErrorUsers.length;
  const failedMsg = `Announcement could not be delivered to ${failedCount} users.`;
  const successMsg = `Announcement successfully delivered to ${successful.length} recipients.`;
  let content;

  if (successful.length !== 0 && failedCount !== 0) {
    content = successMsg + '\n' + failedMsg;
  } else if (failedCount !== 0) {
    content = failedMsg;
  } else {
    content = successMsg;
  }

  let summary = 'User\t\t\tStatus\t\tReason\n';
  successful.forEach((username: string) => {
    summary += `${
      username.length <= 24
        ? username + String(' ').repeat(24 - username.length)
        : username.slice(0, 21) + '   '
    }Delivered\t-\n${
      username.length > 24 ? username.slice(21, username.length) + '\n' : ''
    }`;
  });
  failed.invalidUsers.forEach((username: string) => {
    summary += `${
      username.length <= 24
        ? username + String(' ').repeat(24 - username.length)
        : username.slice(0, 21) + '   '
    }Not Delivered\tInvalid User\n${
      username.length > 24 ? username.slice(21, username.length) + '\n' : ''
    }`;
  });
  failed.notFoundUsers.forEach((username: string) => {
    summary += `${
      username.length <= 24
        ? username + String(' ').repeat(24 - username.length)
        : username.slice(0, 21) + '   '
    }Not Delivered\tUser Not Found In Discord\n${
      username.length > 24 ? username.slice(21, username.length) + '\n' : ''
    }`;
  });
  failed.closedDmUsers.forEach((username: string) => {
    summary += `${
      username.length <= 24
        ? username + String(' ').repeat(24 - username.length)
        : username.slice(0, 21) + '   '
    }Not Delivered\tDMs closed\n${
      username.length > 24 ? username.slice(21, username.length) + '\n' : ''
    }`;
  });
  failed.unknownErrorUsers.forEach((username: string) => {
    summary += `${
      username.length <= 24
        ? username + String(' ').repeat(24 - username.length)
        : username.slice(0, 21) + '   '
    }Not Delivered\tUnknown Error\n${
      username.length > 24 ? username.slice(21, username.length) + '\n' : ''
    }`;
  });

  await interaction.editReply({
    content: content,
    components: [],
    files: [
      {
        attachment: Buffer.from(summary, 'utf8'),
        name: 'announcement_summary.txt',
      },
    ],
  });
};

/**
 * Send DMs to all users with a given role or assignment status
 *
 * @param {CommandInteraction} interaction
 * @param {string} type
 * @param {(string | undefined)} period
 * @param {string} message
 * @returns   {Promise<void>}
 */
export const selectTargets = async (
  interaction: CommandInteraction,
  type: string,
  period: string | undefined,
  message: string
): Promise<void> => {
  switch (type) {
    case 'USERS': {
      const users = await UserModel.find({});
      await sendDMs(interaction, users, message);
      return;
    }
    case 'QUANTIFIERS': {
      const users = await UserModel.find({ roles: UserRole.QUANTIFIER });
      await sendDMs(interaction, users, message);
      return;
    }
    case 'ASSIGNED-QUANTIFIERS':
    case 'UNFINISHED-QUANTIFIERS': {
      const selectedPeriod = (await PeriodModel.findOne({
        name: period,
      })) as PeriodDocument;
      const previousPeriodEndDate = await getPreviousPeriodEndDate(
        selectedPeriod
      );
      const quantifiers: PeriodDetailsQuantifierDto[] =
        await PraiseModel.aggregate([
          {
            $match: {
              createdAt: {
                $gt: previousPeriodEndDate,
                $lte: selectedPeriod?.endDate,
              },
            },
          },
          { $unwind: '$quantifications' },
          {
            $addFields: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              finished: {
                $or: [
                  { $ne: ['$quantifications.dismissed', false] },
                  { $gt: ['$quantifications.score', 0] },
                  { $gt: ['$quantifications.duplicatePraise', null] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$quantifications.quantifier',
              praiseCount: { $count: {} },
              finishedCount: { $sum: { $toInt: '$finished' } },
            },
          },
        ]);
      if (type === 'UNFINISHED-QUANTIFIERS') {
        await sendDMs(
          interaction,
          quantifiers.filter(
            (quantifier) => quantifier.finishedCount !== quantifier.praiseCount
          ),
          message
        );
        return;
      }
      await sendDMs(interaction, quantifiers, message);
      return;
    }
  }
};
