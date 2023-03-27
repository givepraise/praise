import { selector, selectorFamily } from 'recoil';
import { AxiosError, AxiosResponse } from 'axios';
import { ApiAuthGet, isResponseOk } from '../api';
import { EventLogType } from './dto/event-log-type.dto';
import { EventLogPaginatedResponseDto } from '@/model/eventlog/dto/event-log-paginated-response.dto';

export type AllEventLogsQueryParameters = {
  sortColumn: string;
  sortType: string;
  limit: number;
  page: number;
  types: string;
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
    ({ get }): AxiosResponse<EventLogPaginatedResponseDto> | AxiosError => {
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      return get(ApiAuthGet({ url: `/event-log${qs ? `?${qs}` : ''}` })) as
        | AxiosResponse<EventLogPaginatedResponseDto>
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
    ({ get }): EventLogPaginatedResponseDto | undefined => {
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
  get: ({ get }): AxiosResponse<EventLogType[]> | AxiosError => {
    return get(
      ApiAuthGet({
        url: '/event-log/types',
      })
    ) as AxiosResponse<EventLogType[]> | AxiosError;
  },
});

/**
 * Fetch all event logs.
 */
export const AllEventLogTypes = selector({
  key: 'AllEventLogTypes',
  get: ({ get }): EventLogType[] | undefined => {
    const response = get(AllEventLogTypesQuery);
    if (isResponseOk(response)) {
      return response.data;
    }
  },
});
