import { PraiseDetailsDto, PraiseDto } from 'api/dist/praise/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosResponse } from 'axios';
import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  atom,
  atomFamily,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { utcDateToLocal } from '@/utils/date';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isApiResponseAxiosError,
  isResponseOk,
  useAuthApiQuery,
} from './api';

/**
 * Types for `useParams()`
 */
export type PraisePageParams = {
  praiseId: string;
};

/**
 * Stores individual Praise items linked to one or more @PraiseIdList
 */
export const SinglePraise = atomFamily<PraiseDto | undefined, string>({
  key: 'SinglePraise',
  default: undefined,
});

/**
 * Params for @SinglePraiseQuery
 */
type SinglePraiseQueryParams = {
  praiseId: string;
  refreshKey: string | undefined;
};

/**
 * Selector query to fetch a single praise from the api.
 */
export const SinglePraiseQuery = selectorFamily({
  key: 'SinglePraiseQuery',
  get:
    (params: SinglePraiseQueryParams) =>
    ({ get }): AxiosResponse<unknown> => {
      const { praiseId, refreshKey } = params;
      return get(ApiAuthGet({ url: `/praise/${praiseId}`, refreshKey }));
    },
});

/**
 * Hook that fetches a single praise from the api
 */
export const useSinglePraiseQuery = (
  praiseId: string
): PraiseDetailsDto | undefined => {
  const { location } = useHistory();
  const praiseResponse = useRecoilValue(
    SinglePraiseQuery({ praiseId, refreshKey: location.key })
  );
  const [praise, setPraise] = React.useState<PraiseDetailsDto | undefined>(
    undefined
  );
  React.useEffect(() => {
    if (!praise && isResponseOk(praiseResponse)) {
      setPraise(praiseResponse.data);
    }
  }, [praise, praiseResponse]);
  return praise;
};

/**
 * Stores lists of Praise Ids. The following lists exists:
 * - All praise / start page
 * - My praise
 * - Period Praise for a receiver assigned to a quantifier
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
    ({ get }): PraiseDto[] | undefined => {
      const praiseIdList = get(PraiseIdList(listKey));
      const allPraiseList: PraiseDto[] = [];
      if (!praiseIdList) return undefined;
      for (const praiseId of praiseIdList) {
        const praise = get(SinglePraise(praiseId));
        if (praise) allPraiseList.push(praise);
      }
      return allPraiseList;
    },
});

/**
 * The request Id is used to force refresh of AllPraiseQuery
 * AllPraiseQuery subscribes to the value. Increase to trigger
 * refresh.
 */
export const PraiseRequestId = atom({
  key: 'PraiseRequestId',
  default: 0,
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
  periodStart?: string;
  periodEnd?: string;
};

/**
 * Query selector to fetch a list of praise from the api.
 */
export const AllPraiseQuery = selectorFamily<
  AxiosResponse<PaginatedResponseBody<PraiseDto>> | undefined,
  AllPraiseQueryParameters
>({
  key: 'AllPraiseQuery',
  get:
    (query: AllPraiseQueryParameters) =>
    ({ get }): AxiosResponse<PaginatedResponseBody<PraiseDto>> | undefined => {
      if (!query) throw new Error('Invalid query');
      get(PraiseRequestId);
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      const response = get(
        ApiAuthGet({ url: `/praise/all${qs ? `?${qs}` : ''}` })
      );
      if (isResponseOk(response)) {
        return response;
      }
    },
});

/**
 *
 */
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
 * Hook to fetch praise from the api and save
 */
export const useAllPraiseQuery = (
  queryParams: AllPraiseQueryParameters,
  listKey: string
): AxiosResponse<PaginatedResponseBody<PraiseDto>> | undefined => {
  const allPraiseQueryResponse = useAuthApiQuery(AllPraiseQuery(queryParams));
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraiseQueryPagination(listKey)
  );
  const allPraiseIdList = useRecoilValue(PraiseIdList(listKey));

  const saveAllPraiseIdList = useRecoilCallback(
    ({ snapshot, set }) =>
      async (praiseList: PraiseDto[]) => {
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
      (praiseList: PraiseDto[]) => {
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
      paginatedResponse.page <= praisePagination.currentPage
    )
      return;

    const praiseList = paginatedResponse.docs;

    if (Array.isArray(praiseList) && praiseList.length > 0) {
      void saveAllPraiseIdList(praiseList);
      saveIndividualPraise(praiseList);
      setPraisePagination({
        ...praisePagination,
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

type useQuantifyPraiseReturn = {
  quantify: (
    praiseId: string,
    score: number,
    dismissed: boolean,
    duplicatePraise: string | null
  ) => Promise<PraiseDto | undefined>;
};
/**
 * Hook that returns a function to use for closing a period
 */
export const useQuantifyPraise = (): useQuantifyPraiseReturn => {
  const quantify = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        praiseId: string,
        score: number,
        dismissed: boolean,
        duplicatePraise: string | null
      ): Promise<PraiseDto | undefined> => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/praise/${praiseId}/quantify`,
              data: {
                score,
                dismissed,
                duplicatePraise,
              },
            })
          )
        );

        if (isResponseOk(response)) {
          const praise = response.data as PraiseDto;
          set(SinglePraise(praise._id), praise);
          return response.data as PraiseDto;
        }
      }
  );
  return { quantify };
};
