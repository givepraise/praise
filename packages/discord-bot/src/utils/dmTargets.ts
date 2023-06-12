import { PeriodDetailsDto, User } from '../utils/api-schema';
import { CommandInteraction, DiscordAPIError, EmbedBuilder } from 'discord.js';
import { Buffer } from 'node:buffer';
import { FailedToDmUsersList } from '../interfaces/FailedToDmUsersList';
import { apiGet } from './api';

/**
 * Send a custom direct message to a list of users
 *
 */
const sendDMs = async (
  interaction: CommandInteraction,
  users: User[],
  message: EmbedBuilder
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
    const userAccount = user.accounts.filter(
      (acc) => acc.platform === 'DISCORD'
    )[0];
    const userId: string = userAccount?.accountId || 'Unknown user';
    const userName: string = userAccount?.name || userId;
    try {
      const discordUser = await interaction.guild?.members.fetch(userId);
      if (!discordUser) {
        failed.notFoundUsers.push(userAccount?.name || userId);
        continue;
      }
      await discordUser.send({ embeds: [message] });
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
 */
export const selectTargets = async (
  interaction: CommandInteraction,
  type: string,
  period: string | undefined,
  message: EmbedBuilder,
  host: string
): Promise<void> => {
  const users = await apiGet<User[]>('/users', { headers: { host } })
    .then((res) => res.data)
    .catch(() => undefined);

  if (!users) return;
  switch (type) {
    case 'USERS':
    case 'QUANTIFIERS': {
      await sendDMs(
        interaction,
        type === 'QUANTIFIERS'
          ? users.filter((user) => user.roles.includes('QUANTIFIER'))
          : users,
        message
      );
      return;
    }
    case 'RECEIVERS':
    case 'ASSIGNED-QUANTIFIERS':
    case 'UNFINISHED-QUANTIFIERS': {
      if (!period || !period.length) return;

      const selectedPeriod = await apiGet<PeriodDetailsDto>(
        `/periods/${period}`
      )
        .then((res) => res.data)
        .catch(() => undefined);

      if (!selectedPeriod) return;

      if (type === 'RECEIVERS') {
        const receivers = selectedPeriod.receivers?.map((r) => r._id);
        await sendDMs(
          interaction,
          users.filter((user) => receivers?.includes(user._id)),
          message
        );
        return;
      }

      const quantifiers = selectedPeriod.quantifiers;

      if (!quantifiers) return;

      if (type === 'UNFINISHED-QUANTIFIERS') {
        const q = quantifiers
          .filter(
            (quantifier) => quantifier.finishedCount !== quantifier.praiseCount
          )
          .map((q) => q._id);
        await sendDMs(
          interaction,
          users.filter((user) => q.includes(user._id)),
          message
        );
        return;
      }
      const q = quantifiers.map((q) => q._id);
      await sendDMs(
        interaction,
        users.filter((user) => q.includes(user._id)),
        message
      );
      return;
    }
  }
};
