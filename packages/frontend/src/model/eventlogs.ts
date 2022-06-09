import { useAuthApiQuery } from '@/model/api';
import { makeApiAuthClient } from '@/utils/api';
import { EventLogDto, EventLogTypeDto } from 'api/dist/eventlog/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { atom, selector } from 'recoil';

export type AllEventLogsQueryParameters = {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
  type?: string;
  search?: string;
};

export const eventLogsQueryParameters = atom({
  key: 'QueryParameters',
  default: {
    sortColumn: 'createdAt',
    sortType: 'desc',
    limit: 15,
    page: 1,
    type: '',
    search: '',
  },
});

/**
 * Query selector that fetches all praise periods from the API.
 */
export const AllEventLogsQuery = selector({
  key: 'AllEventLogsQuery',
  get: async ({ get }): Promise<AxiosResponse<unknown>> => {
    const queryParams = get(eventLogsQueryParameters);

    const apiAuthClient = makeApiAuthClient();
    const response = await apiAuthClient.get('/eventlogs/all', {
      params: queryParams,
    });

    return response;
  },
});

export const useAllEventLogs = (): {
  data: PaginatedResponseBody<EventLogDto>;
  loading: boolean;
} => {
  const allEventLogsQueryResponse = useAuthApiQuery(AllEventLogsQuery);

  const paginatedResponse =
    allEventLogsQueryResponse.data as PaginatedResponseBody<EventLogDto>;

  return { data: paginatedResponse, loading: false };
};

export const useAllEventLogTypes = (): {
  types: PaginatedResponseBody<EventLogTypeDto>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [types, setTypes] = useState<PaginatedResponseBody<EventLogTypeDto>>({
    docs: [],
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);

      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get('/eventlogs/types');

      setTypes(response.data);
      setLoading(false);
    };

    void fetchData();
  }, [setTypes, setLoading]);

  return { types, loading };
};
