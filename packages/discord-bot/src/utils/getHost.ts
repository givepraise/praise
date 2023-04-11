import { apiClient } from './api';
import Keyv from 'keyv';
import { PaginatedCommunities } from './api-schema';
import { DiscordClient } from '../interfaces/DiscordClient';

/**
 * Cache host after fetching communities from API
 *
 * @param {string} guildId
 * @returns {Promise<string | undefined>}
 */
export const cacheHosts = async (
  hostCache: Keyv,
  urlCache: Keyv
): Promise<void> => {
  let currPage = 1;
  let nextPage = true;
  while (nextPage) {
    const communityList = await apiClient
      .get(`/communities?page=${currPage}`)
      .then<PaginatedCommunities>((res) => res.data);

    for (const community of communityList.docs) {
      await hostCache.set(community.discordGuildId, community._id);
      await urlCache.set(community.discordGuildId, community.hostname);
    }

    currPage++;
    nextPage = communityList.hasNextPage;
  }
};

/**
 * Fetch Host by id
 *
 * @param {string} guildId
 * @returns {Promise<string | undefined>}
 */
export const getHost = async (
  client: DiscordClient,
  guildId: string
): Promise<string | undefined> => {
  let host = await client.hostCache.get(guildId);

  if (host === undefined) {
    await cacheHosts(client.hostCache, client.urlCache);
    host = await client.hostCache.get(guildId);
  }

  return host;
};
