import { IMedia } from './tweetMedia';
import { IUserSimple } from './twitterUser';
import { PraiseCreateInputDto } from '../lib/praiseAPI';

export interface ITweetAnnotation {
	start: number;
	end: number;
	probability: number;
	type: string;
	normalized_text: string;
}

export interface ITweetHashtag {
	start: number;
	end: number;
	tag: string;
}

export interface ITweetMention {
	start: number;
	end: number;
	username: string;
	id: string;
}

interface ITweetEntitiesUrlImage {
	url: string;
	width: number;
	height: number;
}

export interface ITweetUrl {
	start: number;
	end: number;
	url: string;
	expanded_url: string;
	display_url: string;
	images: ITweetEntitiesUrlImage[];
	status: number;
	title: string;
	description: string;
	unwound_url: string;
	media_key: string;
}

export interface ITweetEntities {
	annotations?: ITweetAnnotation[];
	hashtags?: ITweetHashtag[];
	mentions?: ITweetMention[];
	urls?: ITweetUrl[];
}

export interface ITweetAttachments {
	media_keys: string[];
}

export interface ITweetContextAnnotation {
	domain?: {
		id: string;
		name: string;
		description: string;
	};
	entity?: {
		id: string;
		name: string;
		description: string;
	};
}

export interface ITweetPublicMetrics {
	retweet_count: number;
	reply_count: number;
	like_count: number;
	quote_count: number;
}

interface ITweetReferencedTweet {
	type: string;
	id: string;
}

export interface IBasicTweet {
	id: string;
	text: string;
	edit_history_tweet_ids: string[];
}

export interface ITweet extends IBasicTweet {
	attachments?: ITweetAttachments;
	author_id?: string;
	context_annotations?: ITweetContextAnnotation[];
	conversation_id?: string;
	created_at?: string;
	entities?: ITweetEntities;
	lang?: string;
	possibly_sensitive?: boolean;
	public_metrics?: ITweetPublicMetrics;
	referenced_tweets?: ITweetReferencedTweet[];
	reply_settings?: string;
	source?: string;
}

export interface ITweetWithAuthor extends ITweet {
	author: IUserSimple;
}

export interface ITweetWithPraise extends ITweetWithAuthor {
	isValid?: boolean;
	praise: PraiseCreateInputDto;
}

export interface ITweetResponse {
	data?: ITweet[];
	includes?: {
		users: IUserSimple[];
		tweets: ITweet[];
		media: IMedia[];
	};
	meta: {
		newest_id?: string;
		oldest_id?: string;
		result_count: number;
		next_token?: string;
		previous_token?: string;
	};
	errors: any[];
}
