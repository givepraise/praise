import { apiClient } from './api';
import Keyv from 'keyv';
import { PaginatedCommunities } from './api-schema';

/**
 * Cache host after fetching communities from API
 *
 * @param {string} guildId
 * @returns {Promise<string | undefined>}
 */
export const cacheHosts = async (cache: Keyv): Promise<void> => {
  let currPage = 1;
  while (true) {
    const communityList = await apiClient
      .get(`/communities?page=${currPage}`)
      .then<PaginatedCommunities>((res) => res.data);

    for (const community of communityList.docs) {
      await cache.set(community.discordGuildId, community._id);
    }

    if (communityList.hasNextPage) currPage++;
    else break;
  }
};

/**
 * Fetch Host by id
 *
 * @param {string} guildId
 * @returns {Promise<string | undefined>}
 */
export const getHost = async (
  cache: Keyv,
  guildId: string
): Promise<string | undefined> => {
  let host = await cache.get(guildId);

  if (host === undefined) {
    cacheHosts(cache);
    host = await cache.get(guildId);
  }

  return host;
};
