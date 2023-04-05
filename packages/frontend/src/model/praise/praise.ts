import { Praise } from '@/model/praise/praise.dto';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  atomFamily,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { useApiAuthClient } from '@/utils/api';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { PaginatedResponseBody } from 'shared/interfaces/paginated-response-body.interface';

/**
 * Types for `useParams()`
 */
export type PageParams = {
  praiseId: string;
};

export const praiseSortOptions = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'score', label: 'Top' },
];

interface sortOptionsProps {
  value: string;
  label: string;
}

export const PraiseTableSelectedSortOption = atom<sortOptionsProps>({
  key: 'PraiseTableSelectedSortOption',
  default: praiseSortOptions[0],
});

/**
 * Atom that stores individual Praise items linked to one or more @PraiseIdList
 */
export const SinglePraise = atomFamily<Praise | undefined, string>({
  key: 'SinglePraise',
  default: undefined,
});

/**
 * Selector query to fetch a single praise from the api.
 * @returns Full response/error returned by server.
 */
const SinglePraiseDetailsQuery = selectorFamily({
  key: 'SinglePraiseDetailsQuery',
  get:
    (praiseId: string) =>
    ({ get }): AxiosResponse<Praise> | AxiosError => {
      return get(ApiAuthGet({ url: `/praise/${praiseId}` })) as
        | AxiosResponse<Praise>
        | AxiosError;
    },
});

/**
 * Fetches a single praise from the api
 */
export const useLoadSinglePraiseDetails = (
  praiseId: string
): AxiosResponse<Praise> | AxiosError => {
  const response = useRecoilValue(SinglePraiseDetailsQuery(praiseId));
  const setPraise = useSetRecoilState(SinglePraise(praiseId));
  React.useEffect(() => {
    if (isResponseOk(response)) {
      setPraise(response.data);
    }
  }, [setPraise, response]);
  return response;
};

/**
 * Atom that stores lists of Praise Ids.
 */
export const PraiseIdList = atomFamily<string[] | undefined, string>({
  key: 'PraiseIdList',
  default: undefined,
});

/**
 * Selector to get all praise from a list of praise ids.
 * @param listKey The key the praise id list is stored under.
 */
export const AllPraiseList = selectorFamily({
  key: 'AllPraiseList',
  get:
    (listKey: string) =>
    ({ get }): Praise[] | undefined => {
      const praiseIdList = get(PraiseIdList(listKey));
      const allPraiseList: Praise[] = [];
      if (!praiseIdList) return undefined;
      for (const praiseId of praiseIdList) {
        const praise = get(SinglePraise(praiseId));
        if (praise) allPraiseList.push(praise);
      }
      return allPraiseList;
    },
});

/**
 * Parameters for @AllPraiseQuery
 */
export type AllPraiseQueryParameters = {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
  receiver?: string | null;
  giver?: string | null;
};

/**
 * Selector to fetch a list of praise from the api.
 * @param query Sorting, filtering and pagination.
 */
const AllPraiseQuery = selectorFamily<
  AxiosResponse<PaginatedResponseBody<Praise>> | AxiosError,
  AllPraiseQueryParameters
>({
  key: 'AllPraiseQuery',
  get:
    (query: AllPraiseQueryParameters) =>
    ({ get }): AxiosResponse<PaginatedResponseBody<Praise>> | AxiosError => {
      if (!query) throw new Error('Invalid query');
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      const response = get(ApiAuthGet({ url: `/praise${qs ? `?${qs}` : ''}` }));
      return response as
        | AxiosResponse<PaginatedResponseBody<Praise>>
        | AxiosError;
    },
});

export interface AllPraiseQueryPaginationInterface {
  currentPage: number;
  totalPages: number;
}

/**
 * Atom to keep track of praise paginations.
 */
export const AllPraiseQueryPagination = atomFamily<
  AllPraiseQueryPaginationInterface,
  string
>({
  key: 'AllPraiseQueryPagination',
  default: {
    currentPage: 0,
    totalPages: 0,
  },
});

/**
 * Fetch praise from the api and save.
 * @param queryParams Sorting, filtering and pagination.
 * @param listKey The listKey pointing to the list to store the praise ids in.
 */
export const useAllPraise = (
  queryParams: AllPraiseQueryParameters,
  listKey: string
): AxiosResponse<PaginatedResponseBody<Praise>> | AxiosError => {
  const allPraiseQueryResponse = useRecoilValue(AllPraiseQuery(queryParams));

  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraiseQueryPagination(listKey)
  );
  const allPraiseIdList = useRecoilValue(PraiseIdList(listKey));

  const saveAllPraiseIdList = useRecoilCallback(
    ({ snapshot, set }) =>
      async (praiseList: Praise[]) => {
        const allPraiseIdList = await snapshot.getPromise(
          PraiseIdList(listKey)
        );
        const praiseIdList: string[] = [];
        for (const praise of praiseList) {
          praiseIdList.push(praise._id);
        }

        set(
          PraiseIdList(listKey),
          allPraiseIdList ? allPraiseIdList.concat(praiseIdList) : praiseIdList
        );
      }
  );

  const saveIndividualPraise = useRecoilCallback(
    ({ set }) =>
      (praiseList: Praise[]) => {
        for (const praise of praiseList) {
          set(SinglePraise(praise._id), praise);
        }
      }
  );

  React.useEffect(() => {
    if (
      !allPraiseQueryResponse ||
      isApiResponseAxiosError(allPraiseQueryResponse)
    )
      return;

    const paginatedResponse = allPraiseQueryResponse.data;

    if (
      !paginatedResponse.page ||
      !paginatedResponse.totalPages ||
      !isResponseOk(allPraiseQueryResponse) ||
      paginatedResponse.page === praisePagination.currentPage
    )
      return;

    const praiseList = paginatedResponse.docs;

    if (Array.isArray(praiseList) && praiseList.length > 0) {
      void saveAllPraiseIdList(praiseList);
      saveIndividualPraise(praiseList);
      setPraisePagination({
        currentPage: paginatedResponse.page,
        totalPages: paginatedResponse.totalPages,
      });
    }
  }, [
    allPraiseQueryResponse,
    praisePagination,
    allPraiseIdList,
    saveIndividualPraise,
    saveAllPraiseIdList,
    setPraisePagination,
  ]);

  return allPraiseQueryResponse;
};
