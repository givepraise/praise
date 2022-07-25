import { EventLogDto, EventLogTypeDto } from 'api/dist/eventlog/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { selector, selectorFamily } from 'recoil';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiAuthGet, isResponseOk } from './api';

export type AllEventLogsQueryParameters = {
  sortColumn: string;
  sortType: string;
  limit: number;
  page: number;
  type: string;
  search: string;
};

/**
 * Fetch all event logs.
 * @param query Sorting, filtering and pagination.
 * @returns Full response/error returned by server.
 */
export const AllEventLogsQuery = selectorFamily({
  key: 'AllEventLogsQuery',
  get:
    (query: AllEventLogsQueryParameters) =>
    ({
      get,
    }): AxiosResponse<PaginatedResponseBody<EventLogDto>> | AxiosError => {
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      return get(ApiAuthGet({ url: `/eventlogs/all${qs ? `?${qs}` : ''}` })) as
        | AxiosResponse<PaginatedResponseBody<EventLogDto>>
        | AxiosError;
    },
});

/**
 * Fetch all event logs.
 * @param query Sorting, filtering and pagination.
 * @returns Paginated event log response if query is successful.
 */
export const AllEventLogs = selectorFamily({
  key: 'AllEventLogs',
  get:
    (query: AllEventLogsQueryParameters) =>
    ({ get }): PaginatedResponseBody<EventLogDto> | undefined => {
      const response = get(AllEventLogsQuery(query));
      if (isResponseOk(response)) {
        return response.data;
      }
    },
});

/**
 * Fetch all event log types.
 * @returns Full response/error returned by server.
 */
export const AllEventLogTypesQuery = selector({
  key: 'AllEventLogTypesQuery',
  get: ({
    get,
  }): AxiosResponse<PaginatedResponseBody<EventLogTypeDto>> | AxiosError => {
    return get(
      ApiAuthGet({
        url: '/eventlogs/types',
      })
    ) as AxiosResponse<PaginatedResponseBody<EventLogTypeDto>> | AxiosError;
  },
});

/**
 * Fetch all event logs.
 * @returns Paginated event log types response if query is successful.
 */
export const AllEventLogTypes = selector({
  key: 'AllEventLogTypes',
  get: ({ get }): EventLogTypeDto[] | undefined => {
    const response = get(AllEventLogTypesQuery);
    if (isResponseOk(response)) {
      return response.data.docs;
    }
  },
});
