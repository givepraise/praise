import { getUserAccount } from '../utils/getUserAccount';
import { renderMessage } from '../utils/renderMessage';
import { apiClient } from '../utils/api';
import { CommandHandler } from '../interfaces/CommandHandler';
import { PraisePaginatedResponseDto } from '../utils/api-schema';
import { queryOpenAi } from '../utils/queryOpenAi';
import { EmbedBuilder } from '@discordjs/builders';

/**
 * Execute command /whoami
 * Gives the user information about their account and activation status
 *
 */
export const whoisHandler: CommandHandler = async (
  client,
  interaction,
  host
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const user = interaction.options.getUser('member', true);
  const userAccount = await getUserAccount(user, host);

  if (!process.env.OPENAI_KEY) {
    await interaction.editReply("This feature isn't available yet.");
    return;
  }

  if (!userAccount) {
    await interaction.editReply('No data available on that user so far...');
    return;
  }

  let currPage = 1;
  let totalPages = 1;

  const praise = [];
  while (currPage <= totalPages) {
    const response = await apiClient
      .get(
        `/praise?limit=100&page=${currPage}&receiver=${userAccount._id}&sortType=desc`
      )
      .then<PraisePaginatedResponseDto>((res) => res.data)
      .catch(() => undefined);

    if (!response) break;

    praise.push(...response.docs);

    currPage++;
    totalPages = response.totalPages;
  }

  praise.sort((a, b) => b.score - a.score).slice(0, 100);

  const topPraiseCsv =
    'score, reason\n' +
    praise.map((item) => `${item.score}, ${item.reason}`).join('\n');

  const summaryPrompt = `Below is a table of praise items describing contributions made by community member ${userAccount.name}. Summarize, what kind of work does No account selected do for the community? The first column is a score representing the impact of the contribution, the second column describes the contribution. The higher impact score a contribution has the more it impacts your description of ${userAccount.name}.`;
  const labelPrompt = `Below is a list of contributions made by community member ${userAccount.name}. The first column of the list is a score representing the impact of the contribution, the second column describes the contribution. I want you to create a comma separated list of labels that describe the most impactful work ${userAccount.name} does for the community. The higher impact score a contribution has the more it impacts your description. 7 labels please.`;

  const summary = await queryOpenAi(
    topPraiseCsv,
    summaryPrompt,
    process.env.OPENAI_KEY
  );

  const labels = (
    await queryOpenAi(topPraiseCsv, labelPrompt, process.env.OPENAI_KEY)
  )
    .split(',')
    .map((label: string) => {
      return {
        name: label
          .trim()
          .replace(
            /\w\S*/g,
            (txt) =>
              txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
          ),
        value: '\u200b',
        inline: true,
      };
    });

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle(userAccount.name)
        .setDescription(summary)
        .setThumbnail(
          `https://cdn.discordapp.com/avatars/${user.id}/${user?.avatar || ''}`
        )
        .addFields(labels),
    ],
  });
};
