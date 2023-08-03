import { close, openSync, readFileSync, writeSync } from 'fs';
import { ITweetResponse, ITweetWithAuthor, ITweetWithPraise } from '../types/tweet';
import { getBotMentions, postPraiseTweet } from './twitterAPI';
import ErrorTag from './ErrorTag';
import { Community } from '../types/praiseApiSchema';
import { postPraise, PraiseCreateInputDto } from './praiseAPI';
import Tweets from '../models/tweetModel';

const hostnameToCollection = (hostname: string) => {
	return hostname.replace('.', '-');
};

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
	const receiverIds = mentions?.filter(
		mention => mention !== community.twitterBot.twitterBotUsername,
	);
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

export const addPraiseToTweets = (
	tweets: ITweetWithAuthor[],
	community: Community,
): ITweetWithPraise[] => {
	return tweets.map(tweet => {
		const praise = createPraiseObj(tweet, community);
		const isValid = checkPraiseValidity(praise);
		return { ...tweet, isValid, praise };
	});
};

export const preparePraiseTweet = (params: PraiseCreateInputDto): string => {
	const { receiverIds, giver, reason } = params;
	const receiversString = receiverIds.join(' and @');
	return `@${giver} has praised @${receiversString} ${reason}`;
};

const checkPraiseValidity = (praise: PraiseCreateInputDto) => {
	return !!(
		praise.giver &&
		praise.receiverIds &&
		praise.receiverIds.length > 0 &&
		praise.reason
	);
};

export const getAndSaveMentions = async (
	community: Community,
): Promise<ITweetWithPraise[] | undefined> => {
	const collection = hostnameToCollection(community.hostname);
	try {
		const communityTweets = await Tweets(collection).find().sort({ id: -1 });
		const lastMentionId = communityTweets[0]?.id;
		const mentionsResponse = await getBotMentions(
			community.twitterBot,
			lastMentionId,
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
		const tweetsWithPraises = addPraiseToTweets(tweetsWithAuthors, community);
		await Tweets(collection).insertMany(tweetsWithPraises, { ordered: false });
		createLog(
			`${community.name}: Added mentions: ${mentionsIds.join()}`,
			'new mentions added to local DB',
		);
		return tweetsWithPraises;
	} catch (error) {
		createLog(error, 'getAndSaveMentions');
		throw new ErrorTag(error);
	}
};

enum EReplyTweet {
	INVALID_TWEET = 'Praise tweets must have at least one receiver and a reason.',
	PRAISE_GIVEN = '✅ Praise given',
}

export const sendBatchReplies = async (
	community: Community,
	tweets: ITweetWithPraise[],
	text: string,
) => {
	try {
		const tweetsPromises = [];
		tweets.forEach(tweet => {
			const tweetPromise = postPraiseTweet(community, {
				// TODO: add praise link
				text,
				inReplyToID: tweet.id,
			});
			tweetsPromises.push(tweetPromise);
		});
		const results = await Promise.all(tweetsPromises);
		const tweetIDs = results.map(result => result.id);
		createLog(`Sent replies IDs: ${tweetIDs.join()}`, 'Batch replies sent');
	} catch (error) {
		createLog(error, 'sendBatchReplies');
		throw new ErrorTag(error);
	}
};

const sendRepliesToInvalidTweets = async (community: Community) => {
	try {
		const collection = hostnameToCollection(community.hostname);
		const invalidTweets = await Tweets(collection).find({ isValid: false });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		await sendBatchReplies(community, invalidTweets, EReplyTweet.INVALID_TWEET);
		console.log(invalidTweets);
	} catch (error) {
		createLog(error, 'sendRepliesToInvalidTweets');
		throw new ErrorTag(error);
	}
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
		await getAndSaveMentions(community);
		await sendRepliesToInvalidTweets(community);
		// console.log(newMentions);
		// const users = await apiGet('/useraccounts', {
		// 	headers: { host: community.hostname },
		// }).then(res => res.data);
		// console.log(users);
		// if (newMentions) {
		// const newMentions = await tweetsCache.get(community.name);

		// await sendPraisesToAPI(community, newMentions);
		// 	await sendBatchTweets(community, newMentions);
		// }
		console.log('Job done');
	} catch (error) {
		createLog(error, 'mainJob');
		throw new ErrorTag(error);
	}
};
