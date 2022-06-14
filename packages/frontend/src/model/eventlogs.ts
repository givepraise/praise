import { makeApiAuthClient } from '@/utils/api';
import { EventLogDto } from 'types/dist/eventlog/types';
import { PaginatedResponseBody } from 'types/dist/query/types';
import { useEffect, useState } from 'react';

export type AllEventLogsQueryParameters = {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
};

export const useAllEventLogs = ({
  page,
  limit,
  sortColumn,
  sortType,
}: AllEventLogsQueryParameters): {
  data: PaginatedResponseBody<EventLogDto>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PaginatedResponseBody<EventLogDto>>({
    docs: [],
  });

  useEffect(() => {
    const fetchData = async (page, limit): Promise<void> => {
      setLoading(true);

      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get('/eventlogs/all', {
        params: {
          page,
          limit,
          sortColumn,
          sortType,
        },
      });

      setData(response.data);
      setLoading(false);
    };

    void fetchData(page, limit);
  }, [page, limit, sortColumn, sortType, setData, setLoading]);

  return { data, loading };
};
