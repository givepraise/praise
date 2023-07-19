// eslint-disable-next-line import/named
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from 'dotenv';
import isDocker from './isDocker';
import { createLog, rootEnvPath } from './helpers';
import ErrorTag from './ErrorTag';
import { CommunityPaginatedResponseDto } from '../types/praiseApiSchema';
import { IPraise } from '../types/praise';

config({ path: rootEnvPath });

interface PraiseCreateInputDto {
	reason: string;
	reasonRaw: string;
	giver: {
		accountId: string;
		name: string;
		avatarId?: string;
		platform: string;
	};
	receiverIds: string[];
	sourceId: string;
	sourceName: string;
}

export const postPraise = async (praise: IPraise): Promise<any> => {
	const res = await apiPost<Praise[], PraiseCreateInputDto>('/praise', praiseData, {
		headers: { host },
	});
	console.log(res);
};

export const fetchCommunities = async (): Promise<any[]> => {
	let currPage = 1;
	let totalPages = 1;
	const communities: any[] = [];
	while (currPage <= totalPages) {
		const communityList = await apiGet<CommunityPaginatedResponseDto>(
			`/communities?page=${currPage}`,
		).then(res => res.data);

		for (const community of communityList.docs) {
			if (community.discordGuildId) {
				communities.push(community);
			}
		}

		currPage++;
		totalPages = communityList.totalPages;
	}
	return communities;
};

export const apiBaseURL = isDocker()
	? `http://api:${process.env.API_PORT as string}/api`
	: `${process.env.API_URL as string}/api`;

/**
 * Get the API key for the Twitter bot from the list of API keys and roles
 * defined in the environment variables.
 */
function getApiKey(): string {
	const keys = process.env.API_KEYS?.split(',');
	const keyRoles = process.env.API_KEY_ROLES?.split(',');

	if (!keys || !keyRoles) {
		throw new Error('API_KEYS and API_KEY_ROLES must be defined');
	}

	const keyIndex = keyRoles.indexOf('API_KEY_DISCORD_BOT');
	return keys[keyIndex];
}

/**
 * Axios instance for the API.
 */
export const apiClient = axios.create({
	baseURL: apiBaseURL,
	headers: {
		'user-agent': 'TwitterBot/0.1.0',
		'x-api-key': getApiKey(),
	},
});

export async function apiGet<T>(
	endpoint: string,
	config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
	try {
		return await apiClient.get<T>(endpoint, config);
	} catch (error) {
		createLog(error, 'postPraiseTweet');
		throw new ErrorTag(error);
	}
}

export async function apiPost<T, U>(
	endpoint: string,
	data?: U,
	config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
	try {
		return await apiClient.post<T>(endpoint, data, config);
	} catch (error) {
		createLog(error, 'postPraiseTweet');
		throw new ErrorTag(error);
	}
}

export async function apiPatch<T, U>(
	endpoint: string,
	data?: U,
	config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
	try {
		return await apiClient.patch<T>(endpoint, data, config);
	} catch (error) {
		createLog(error, 'postPraiseTweet');
		throw new ErrorTag(error);
	}
}
