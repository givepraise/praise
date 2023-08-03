import { AxiosResponse, AxiosError } from 'axios';
import { selectorFamily } from 'recoil';
import { ApiGet, isResponseOk } from '../api';
import { Community } from './dto/community.dto';
import { FindAllCommunitiesQueryDto } from './dto/find-all-communities-query.dto';
import { FindAllCommunitiesResponseDto } from './dto/find-all-communities-response.dto';
import { objectToQs } from '../../utils/querystring';

/**
 * Fetch a single community.
 * @returns Full response/error returned by server.
 */
export const CommunityQuery = selectorFamily({
  key: 'CommunityQuery',
  get:
    (id: string) =>
    ({ get }): AxiosResponse<Community> | AxiosError => {
      return get(
        ApiGet({
          url: `/communities/${id}`,
        })
      ) as AxiosResponse<Community> | AxiosError;
    },
});

/**
 * Fetch a single community.
 * @returns Community object or undefined if not found.
 */
export const SingleCommunity = selectorFamily({
  key: 'SingleCommunity',
  get:
    (id: string) =>
    ({ get }): Community | undefined => {
      const response = get(CommunityQuery(id));
      if (isResponseOk(response)) {
        return response.data;
      }
    },
});

/**
 * Fetch all communities.
 * @returns Full response/error returned by server.
 */
export const AllCommunitiesQuery = selectorFamily({
  key: 'AllCommunitiesQuery',
  get:
    (query: FindAllCommunitiesQueryDto) =>
    ({ get }): AxiosResponse<FindAllCommunitiesResponseDto> | AxiosError => {
      return get(
        ApiGet({
          url: `/communities?${objectToQs(query)}`,
        })
      ) as AxiosResponse<FindAllCommunitiesResponseDto> | AxiosError;
    },
});

/**
 * Fetch a single community based on hostname.
 * @returns Array of community objects or undefined if not found.
 */
export const CommunityByHostname = selectorFamily({
  key: 'CommunityByHostname',
  get:
    (hostname: string) =>
    ({ get }): Community | undefined => {
      const response = get(
        AllCommunitiesQuery({ hostname, limit: 1, page: 1 })
      );
      if (isResponseOk(response)) {
        return response.data.docs[0];
      }
    },
});
