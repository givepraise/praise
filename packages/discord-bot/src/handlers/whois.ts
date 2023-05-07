import { GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/embeds/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { renderMessage } from '../utils/renderMessage';
import { UserAccount } from '../utils/api-schema';
import { apiClient } from '../utils/api';
import { CommandHandler } from '../interfaces/CommandHandler';
import { PraisePaginatedResponseDto } from '../utils/api-schema';
import { queryOpenAi } from '../utils/queryOpenAi';
import { EmbedBuilder } from '@discordjs/builders';
import { ActionRowBuilder } from '@discordjs/builders';
import { ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle } from 'discord.js';
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

  // const topPraiseCsv =
  //   'score, reason\n' +
  //   praise.map((item) => `${item.score}, ${item.reason}`).join('\n');
  const topPraiseCsv = `15.67, for the amazing adventure and getting Livia in everything and for taking care of everyone and just being super generous
  15.67, for leading the TEC forward, both physically and virtually
  15, for being some of the most dedicated and generous leaders around
  15, for the work he did yesterday on giving great ideas on the spot for how to move forward with the time constraints on our current proposal-making phase
  15, for leading a lot of efforts around the debates and parameters and new proposals
  15, for having lead us from an idea, on to a successful Hatch and now through a successful Commons Launch
  14.67, for working on the params
  14.5, for kicking off the Param Hack sesh and reviewing the current status of all the things
  14.5, for bringing your wealth of experience into all the important decisions that need to be made, everytime.
  14.5, for collaborating in the first meeting of the finance/revenues working group and for helping to figure out how we coordinate ourselves going forward.
  14.5, for facilitating the communtiy call with HIGH VIBES and incredible enthusiasm week after week (with very little praise for it!)
  14.25, for moderating an exceptional debate and keeping it on time which seemed impossible
  14, for all the work he did in Paris and his great talk
  14, for your unwavering leadership, week after week, and for leading everyone with poise and professionalism
  14, for hyping up giveth at ethdenver // my heart weeps for our houseless neighbors and I love where everyone's heads at about funding public goods. // thank you for spreading influential messages in these times.
  13.88, for working overtime seeming all the time to get all the commons upgrade pieces deployed
  13.88, for the epic work around the Hatch, the ABC, EVM-Crispr, and the CU
  13.88, for the hard work around the TEC token launch
  13.75, for continuing to help me understand the params and for being so accommodating with information and @anson parker for introducing me to TEC.
  13.75, for all the work they put into making the dashboard happen
  13.75, for championing proposals and getting them up on the forum!
  13.75, for a super chill Commons Upgrade proposal presentation working session ❤️
  13.75, for representing TEC and Giveth in the water multisig
  13.6, for staying up to the wee hours working on the IH distribution so we could Hatch today! 🎉
  13.25, for being our mentors and spreading their amazing vibes
  13.25, for facilitating Params Parties and debates: we moved a long way forward with that so thank all of you!
  13.22, for incorporating the CCD’s user testing feedback into the actual tool
  13, for the epic road trip we had to Paris!!!
  13, for making an amazing TEC gathering in Paris possible`;
  const summaryPrompt = `Below is a table of praise items describing contributions made by community member ${userAccount.name}. Summarize, what kind of work does No account selected do for the community? The first column is a score representing the impact of the contribution, the second column describes the contribution. The higher impact score a contribution has the more it impacts your description of ${userAccount.name}.`;
  const labelPrompt = `Below is a list of contributions made by community member ${userAccount.name}. The first column of the list is a score representing the impact of the contribution, the second column describes the contribution. I want you to create a comma separated list of labels that describe the most impactful work ${userAccount.name} does for the community. The higher impact score a contribution has the more it impacts your description. 7 labels please.`;

  const summary = await queryOpenAi(
    topPraiseCsv,
    summaryPrompt,
    process.env.OPENAI_KEY
  );

  let val = 0;
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
          `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
        )
        .addFields(labels),
    ],
  });
};
