import { model, Schema } from 'mongoose';

const imageModel = new Schema({
	url: { type: String, required: true },
	width: { type: Number, required: true },
	height: { type: Number, required: true },
});

const hashtagModel = new Schema({
	start: { type: Number, required: true },
	end: { type: Number, required: true },
	tag: { type: String, required: true },
});

const entitiesAnnotationModel = new Schema({
	start: { type: Number, required: true },
	end: { type: Number, required: true },
	probability: { type: Number, required: true },
	type: { type: String, required: true },
	normalized_text: { type: String, required: true },
});

const entitiesUrlModel = new Schema({
	start: { type: Number, required: false },
	end: { type: Number, required: false },
	url: { type: String, required: false },
	expanded_url: { type: String, required: false },
	display_url: { type: String, required: false },
	images: { type: [imageModel], required: false },
	status: { type: Number, required: false },
	title: { type: String, required: false },
	description: { type: String, required: false },
	unwound_url: { type: String, required: false },
	media_key: { type: String, required: false },
});

const mentionModel = new Schema({
	start: { type: Number, required: true },
	end: { type: Number, required: true },
	username: { type: String, required: true },
	id: { type: String, required: true },
});

const entitiesModel = new Schema({
	// urls: { type: [entitiesUrlModel], required: false },
	mentions: { type: [mentionModel], required: false },
	// hashtags: { type: [hashtagModel], required: false },
	// annotations: { type: [entitiesAnnotationModel], required: false },
});

const attachmentsModel = new Schema({
	media_keys: { type: [String], required: false },
});

const publicMetricsModel = new Schema({
	retweet_count: { type: Number, required: false },
	reply_count: { type: Number, required: false },
	like_count: { type: Number, required: false },
	quote_count: { type: Number, required: false },
});

const contextDomainModel = new Schema({
	id: { type: String, required: false },
	name: { type: String, required: false },
	description: { type: String, required: false },
});

const contextEntityModel = new Schema({
	id: { type: String, required: false },
	name: { type: String, required: false },
	description: { type: String, required: false },
});

const contextAnnotationModel = new Schema({
	domain: { type: contextDomainModel, required: false },
	entity: { type: contextEntityModel, required: false },
});

const referencedTweetModel = new Schema({
	type: { type: String, required: false },
	id: { type: String, required: false },
});

const authorModel = new Schema({
	id: { type: String, required: true },
	username: { type: String, required: true },
	name: { type: String, required: true },
});

const tweetsModelV2 = new Schema({
	attachments: { type: attachmentsModel, required: false },
	author: { type: authorModel, required: false },
	author_id: { type: String, required: false },
	// context_annotations: { type: [contextAnnotationModel], required: false },
	conversation_id: { type: String, required: false },
	created_at: { type: Date, required: false },
	edit_history_tweet_ids: { type: [String], required: false },
	entities: { type: entitiesModel, required: false },
	id: { type: String, required: true, unique: true },
	lang: { type: String, required: false },
	possibly_sensitive: { type: Boolean, required: false },
	public_metrics: { type: publicMetricsModel, required: false },
	// referenced_tweets: { type: [referencedTweetModel], required: false },
	reply_settings: { type: String, required: false },
	source: { type: String, required: false },
	text: { type: String, required: false },
});

const Tweets = (collection: string) => model('tweetsModelV2', tweetsModelV2, collection);

export default Tweets;
