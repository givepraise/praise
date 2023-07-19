import crypto from 'crypto';
import axios from 'axios';
import { createLog } from './helpers';
import { IBasicTweet, ITweetResponse } from '../types/tweet';
import ErrorTag from './ErrorTag';
// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-commonjs
const OAuth = require('oauth-1.0a');

interface ITweetParams {
	text: string;
	inReplyToID: string;
}

export const postPraiseTweet = async (
	twitterBot: any,
	tweetParams: ITweetParams,
): Promise<IBasicTweet> => {
	const { text, inReplyToID } = tweetParams;
	const { consumerKey, consumerSecret, accessToken, tokenSecret } = twitterBot;
	const url = `https://api.twitter.com/2/tweets`;
	const oauth = OAuth({
		consumer: {
			key: consumerKey,
			secret: consumerSecret,
		},
		signature_method: 'HMAC-SHA1',
		hash_function: (baseString, key) =>
			crypto.createHmac('sha1', key).update(baseString).digest('base64'),
	});

	const authHeader = oauth.toHeader(
		oauth.authorize(
			{
				url,
				method: 'POST',
			},
			{
				key: accessToken,
				secret: tokenSecret,
			},
		),
	);

	try {
		const { data } = await axios.post(
			url,
			{
				text,
				reply: {
					in_reply_to_tweet_id: inReplyToID,
				},
			},
			{
				headers: {
					Authorization: authHeader.Authorization,
					'Content-Type': 'application/json',
				},
			},
		);
		return data.data;
	} catch (error) {
		createLog(error, 'postPraiseTweet');
		throw new ErrorTag(error);
	}
};

export const getBotMentions = async (
	twitterBot: any,
	lastMentionId?: string,
): Promise<ITweetResponse> => {
	const { twitterBotId, bearerToken } = twitterBot;
	try {
		const url = `https://api.twitter.com/2/users/${twitterBotId}/mentions?`;
		const params = {
			max_results: '100',
			'user.fields': 'username',
			'tweet.fields': 'author_id',
			expansions: 'entities.mentions.username,author_id',
			since_id: lastMentionId,
		};
		if (!lastMentionId) {
			delete params.since_id;
		}
		const searchParams = new URLSearchParams(params);
		const urlWithParams = `${url}${searchParams}`;
		const { data } = await axios.get(urlWithParams, {
			headers: {
				Authorization: `Bearer ${bearerToken}`,
			},
		});
		return data;
	} catch (error) {
		createLog(error, 'getBotMentions');
		throw new ErrorTag(error);
	}
};
