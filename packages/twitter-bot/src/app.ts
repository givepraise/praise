import { createLog, mainJob } from './lib/helpers';
import ErrorTag from './lib/ErrorTag';
import { fetchCommunities } from './lib/praiseAPI';

export default async function App() {
	try {
		const communities = await fetchCommunities();
		const twitterEnabledCommunities = communities.filter(
			c => c.twitterBot?.twitterBotId,
		);
		// console.log(twitterEnabledCommunities);
		// setInterval(() => mainJob(), 1000 * 60 * 10);
		for (const community of twitterEnabledCommunities) {
			// console.log(community);
			await mainJob(community);
		}
		// console.log(process.env);
	} catch (error) {
		createLog(error, 'App');
		throw new ErrorTag(error);
	}
}
