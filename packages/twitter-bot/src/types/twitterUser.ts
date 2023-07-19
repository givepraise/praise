import { ITweet } from './tweet';

interface IUserEntityUrl {
	start: number;
	end: number;
	url: string;
	expanded_url: string;
	display_url: string;
}

interface IUserEntityMention {
	start: number;
	end: number;
	username: string;
}

interface IUserEntityDescription {
	urls: IUserEntityUrl[];
	mentions: IUserEntityMention[];
}

interface IUserEntities {
	url?: {
		urls: IUserEntityUrl[];
	};
	description?: IUserEntityDescription;
}

interface IUserPublicMetrics {
	followers_count: number;
	following_count: number;
	tweet_count: number;
	listed_count: number;
}

export interface IUser {
	id: string;
	name?: string;
	username?: string;
	created_at?: string;
	description?: string;
	entities?: IUserEntities;
	location?: string;
	pinned_tweet_id?: string;
	last_tweet_id?: string;
	profile_image_url?: string;
	protected?: boolean;
	public_metrics?: IUserPublicMetrics;
	url?: string;
	verified?: boolean;
	withheld?: object;
}

export interface IUserSimple {
	id: string;
	name?: string;
	username?: string;
}

export interface IRawUser {
	data: IUser;
	includes?: {
		tweets: ITweet[];
	};
}
