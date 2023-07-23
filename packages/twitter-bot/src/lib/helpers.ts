import { close, openSync, readFileSync, writeSync } from 'fs';
import { config } from 'dotenv';
import Keyv from 'keyv';
import { ITweetResponse, ITweetWithAuthor } from '../types/tweet';
import { getBotMentions, postPraiseTweet } from './twitterAPI';
import ErrorTag from './ErrorTag';
import { Community } from '../types/praiseApiSchema';
import { postPraise, PraiseCreateInputDto } from './praiseAPI';

config();

const tweetsCache = new Keyv<ITweetWithAuthor[]>('sqlite://tweetsCache.sqlite');
tweetsCache.on('error', console.log);

const { TWITTER_USERNAME } = process.env;

export const createLog = (str: any, tag?: string) => {
	if (typeof str !== 'string' && str.hasTag) {
		return;
	}
	tag && console.log({ fullMessage: str, response: str.response, tag });
	const oldData = readFileSync(global.logFile);
	const fd = openSync(global.logFile, 'w+');
	const log = `Date: ${new Date().toLocaleString()}\nLog: ${str} ${
		str.response?.statusText ? `\nResponse: ${str.response.statusText}` : ''
	} ${tag ? `\nTag: ${tag}` : ''}\n\n`;
	const buffer = Buffer.from(log);
	writeSync(fd, buffer, 0, buffer.length, 0); //write new data
	writeSync(fd, oldData, 0, oldData.length, buffer.length); //append old data
	close(fd);
};

export const addAuthorToTweets = (rawResponse: ITweetResponse): ITweetWithAuthor[] => {
	const tweets = rawResponse.data;
	const users = rawResponse.includes.users;
	return tweets.map(tweet => {
		const user = users.find(user => user.id === tweet.author_id);
		return { ...tweet, author: user };
	});
};

export const createPraiseObj = (
	tweet: ITweetWithAuthor,
	community: Community,
): PraiseCreateInputDto => {
	const mentions = tweet.entities?.mentions.map(mention => mention.username);
	const receiverIds = mentions?.filter(mention => mention !== TWITTER_USERNAME);
	const giver = {
		accountId: tweet.author.id,
		name: tweet.author.username,
		platform: 'TWITTER',
	};
	const lastMention = tweet.entities?.mentions.sort((a, b) => b.end - a.end)[0];
	const reason = tweet.text.substring(lastMention.end).trim();
	const reasonRaw = tweet.text.substring(lastMention.end).trim();
	const sourceId = `TWITTER:${community.twitterBot.twitterBotUsername}:${community.twitterBot.twitterBotId}`;
	const sourceName = `TWITTER:${community.twitterBot.twitterBotName}`;
	return { reason, receiverIds, giver, reasonRaw, sourceId, sourceName };
};

export const preparePraiseTweet = (params: PraiseCreateInputDto): string => {
	const { receiverIds, giver, reason } = params;
	const receiversString = receiverIds.join(' and @');
	return `@${giver} has praised @${receiversString} ${reason}`;
};

export const getAndSaveMentions = async (
	community: Community,
): Promise<ITweetWithAuthor[] | undefined> => {
	try {
		const communityTweets = await tweetsCache.get(community.name);
		const mentionsResponse = await getBotMentions(
			community.twitterBot,
			communityTweets[0]?.id,
		);
		if (mentionsResponse?.meta?.result_count === 0) {
			createLog(`${community.name}: Mentions are up to date`, 'no new mentions');
			return undefined;
		}
		const mentionsIds = mentionsResponse.data?.map(mention => mention.id);
		createLog(
			`${community.name}: Fetched mentions: ${mentionsIds.join()}`,
			'new mentions fetched',
		);
		const tweetsWithAuthors = addAuthorToTweets(mentionsResponse);
		await tweetsCache.set(community.name, tweetsWithAuthors);
		createLog(
			`${community.name}: Added mentions: ${mentionsIds.join()}`,
			'new mentions added to local DB',
		);
		return tweetsWithAuthors;
	} catch (error) {
		createLog(error, 'getAndSaveMentions');
		throw new ErrorTag(error);
	}
};

export const sendBatchTweets = async (
	community: Community,
	tweets: ITweetWithAuthor[],
) => {
	try {
		const tweetsPromises = [];
		tweets.forEach(tweet => {
			const praiseParams = createPraiseObj(tweet, community);
			const praiseTweet = preparePraiseTweet(praiseParams);
			const tweetPromise = postPraiseTweet(community.twitterBot, {
				text: praiseTweet,
				inReplyToID: tweet.id,
			});
			tweetsPromises.push(tweetPromise);
		});
		const results = await Promise.all(tweetsPromises);
		const tweetIDs = results.map(result => result.id);
		createLog(`Sent tweet IDs: ${tweetIDs.join()}`, 'Batch Tweets sent');
	} catch (error) {
		createLog(error, 'sendBatchTweets');
		throw new ErrorTag(error);
	}
};

const checkPraiseValidity = (praise: PraiseCreateInputDto) => {
	return (
		praise.giver &&
		praise.receiverIds &&
		praise.receiverIds.length > 0 &&
		praise.reason
	);
};

const sendPraisesToAPI = async (
	community: Community,
	praiseTweets: ITweetWithAuthor[],
) => {
	try {
		const praiseParams = praiseTweets.map(tweet => createPraiseObj(tweet, community));
		const validPraises = praiseParams.filter(checkPraiseValidity);
		// console.log(validPraises);
		// const praisePromises = validPraises.map(praise =>
		// 	postPraise(praise, community.hostname),
		// );
		// await Promise.all(praisePromises);
		await postPraise(validPraises[0], community.hostname);
	} catch (error) {
		createLog(error, 'sendPraisesToAPI');
		throw new ErrorTag(error);
	}
};

export const mainJob = async (community: Community) => {
	try {
		// const newMentions = await getAndSaveMentions(community);
		// if (newMentions) {
		const newMentions = await tweetsCache.get(community.name);

		await sendPraisesToAPI(community, newMentions);
		// 	await sendBatchTweets(community, newMentions);
		// }
		console.log('Job done');
	} catch (error) {
		createLog(error, 'mainJob');
		throw new ErrorTag(error);
	}
};
