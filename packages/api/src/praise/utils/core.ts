import { Client, Util } from 'discord.js';
import { PeriodDateRange, PeriodDocument } from '@period/types';
import { PeriodModel } from '@period/entities';
import { PraiseModel } from '../entities';
import { PraiseDocument, Quantification } from '../types';

/**
 * Fetch the period associated with a praise instance,
 *  (as they are currently not related in database)
 *
 * Determines the associated period by:
 *  finding the period with the lowest endDate, that is greater than the praise.createdAt date
 *
 * @param {PraiseDocument} praise
 * @returns {(Promise<PeriodDocument | undefined>)}
 */
export const getPraisePeriod = async (
  praise: PraiseDocument
): Promise<PeriodDocument | undefined> => {
  const period = await PeriodModel.find(
    // only periods ending after praise created
    {
      endDate: { $gte: praise.createdAt },
    },
    null,
    // sort periods by ending date ascending
    {
      sort: { endDate: 1 },
    }

    // select the period with the earliest ending date
  ).limit(1);

  if (!period || period.length === 0) return undefined;

  return period[0];
};

/**
 * Count Praise created within any given date range
 *
 * @param {PeriodDateRange[]} dateRanges
 * @param {object} [match={}]
 * @returns {Promise<number>}
 */
export const countPraiseWithinDateRanges = async (
  dateRanges: PeriodDateRange[],
  match: object = {}
): Promise<number> => {
  const withinDateRangeQueries: { $createdAt: PeriodDateRange }[] =
    dateRanges.map((q) => ({
      $createdAt: q,
    }));

  const assignedPraiseCount: number = await PraiseModel.count({
    $or: withinDateRangeQueries,
    ...match,
  });

  return assignedPraiseCount;
};

/**
 * Check if Praise.quantification was completed
 *
 * @param {Quantification} quantification
 * @returns {boolean}
 */
export const isQuantificationCompleted = (
  quantification: Quantification
): boolean => {
  return (
    quantification.dismissed ||
    quantification.duplicatePraise !== undefined ||
    quantification.score > 0
  );
};

/**
 * Configure and initialize discord client,
 *  and fetch guild members into client cache
 *
 * @returns {Promise<Client>}
 */
export const prepareDiscordClient = async (): Promise<Client> => {
  const discordClient = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS'],
  });
  await discordClient.login(process.env.DISCORD_TOKEN);
  await discordClient.guilds.fetch();
  const discordGuild = await discordClient.guilds.fetch(
    process.env.DISCORD_GUILD_ID as string
  );
  await discordGuild.members.fetch();

  return discordClient;
};

/**
 * Convert text from discord into a "realized" form
 *  replacing raw references to channels and users with their human-readable text
 *
 * @param {Client} discordClient
 * @param {string} discordChannelId
 * @param {string} text
 * @returns {Promise<string>}
 */
export const realizeDiscordContent = async (
  discordClient: Client,
  discordChannelId: string,
  text: string
): Promise<string> => {
  const channel = await discordClient.channels.fetch(discordChannelId);

  if (!channel) throw Error('Failed to fetch channel from discord api');
  if (!channel.isText()) throw Error('Channel must be a TextChannel');

  const textRealized = Util.cleanContent(text, channel);

  return textRealized;
};
