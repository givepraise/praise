import { apiGet } from './api';
import Keyv from 'keyv';
import { Community, CommunityPaginatedResponseDto } from './api-schema';
import { DiscordClient } from '../interfaces/DiscordClient';

/**
 * Cache host after fetching communities from API
 *
 */
export const buildCommunityCache = async (cache: Keyv): Promise<void> => {
  let currPage = 1;
  let totalPages = 1;
  while (currPage <= totalPages) {
    const communityList = await apiGet<CommunityPaginatedResponseDto>(
      `/communities?page=${currPage}`
    ).then((res) => res.data);

    for (const community of communityList.docs) {
      if (community.discordGuildId) {
        await cache.set(community.discordGuildId, community);
      }
    }

    currPage++;
    totalPages = communityList.totalPages;
  }
};

/**
 * Fetch Host by id
 *
 */
export const getCommunityFromCache = async (
  client: DiscordClient,
  guildId: string
): Promise<Community | undefined> => {
  let host = await client.communityCache.get(guildId);

  if (host === undefined) {
    await buildCommunityCache(client.communityCache);
    host = await client.communityCache.get(guildId);
  }

  return host;
};
