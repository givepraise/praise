import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  atomFamily,
  GetRecoilValue,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isApiResponseAxiosError,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { SingleFloatSetting } from './settings';
import { UserAccount } from './users';

export interface Quantification {
  createdAt?: string;
  updatedAt?: string;
  quantifier: string;
  score: number;
  duplicateScore?: number;
  dismissed?: boolean;
  duplicatePraise?: string;
}

export interface Praise {
  _id: string;
  createdAt: string;
  updatedAt: string;
  periodId?: number;
  reason: string;
  quantifications?: Quantification[];
  giver: UserAccount;
  receiver: UserAccount;
  source: string;
  avgScore?: number;
}

// A local only copy of all praises. Used to facilitate CRUD
// without having to make full roundtrips to the server
export const AllPraiseIdList = atomFamily<string[] | undefined, string>({
  key: 'AllPraiseIdList',
  default: undefined,
});

export const SinglePraise = atomFamily<Praise | undefined, string>({
  key: 'SinglePraise',
  default: undefined,
});

export const SinglePraiseQuery = selectorFamily({
  key: 'SinglePraiseQuery',
  get:
    (praiseId: string) =>
    ({ get }) => {
      get(PraiseRequestId);
      const response = get(ApiAuthGet({ url: `/api/praise/${praiseId}` }));
      return response;
    },
});

export const useSinglePraiseQuery = (praiseId: string) => {
  const praise = useRecoilValue(SinglePraise(praiseId));

  const fetchSinglePraise = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const response = await ApiQuery(
          snapshot.getPromise(SinglePraiseQuery(praiseId))
        );
        if (isResponseOk(response)) {
          set(SinglePraise(praiseId), response.data);
        } else {
          //TODO handle error
        }
      }
  );

  React.useEffect(() => {
    if (praiseId && !praise) {
      void fetchSinglePraise();
    }
  }, [praiseId, praise, fetchSinglePraise]);

  return praise;
};
export const avgPraiseScore = (praise: Praise | undefined): number => {
  if (!praise || !praise.quantifications || praise.quantifications.length === 0)
    return 0;
  let score = 0;
  let i = 0;
  praise.quantifications.forEach((quantification) => {
    if (
      quantification.duplicatePraise &&
      quantification.duplicateScore &&
      quantification.duplicateScore > 0
    ) {
      score += quantification.duplicateScore;
      i++;
    }
    if (quantification.score > 0) {
      score += quantification.score;
      i++;
    }
  });
  if (score === 0) return 0;
  return Math.round(score / i);
};

const quantWithDuplicateScore = (
  quantification: Quantification,
  get: GetRecoilValue
): Quantification => {
  const quantificationExt = {
    ...quantification,
    duplicateScore: 0,
  };
  if (quantification.duplicatePraise) {
    const duplicatePraisePercentage = get(
      SingleFloatSetting('PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE')
    );
    if (duplicatePraisePercentage) {
      let duplicatePraise = get(SinglePraise(quantification.duplicatePraise));
      if (!duplicatePraise) {
        const duplicatePraiseResponse = get(
          SinglePraiseQuery(quantification.duplicatePraise)
        );
        if (isResponseOk(duplicatePraiseResponse)) {
          duplicatePraise = duplicatePraiseResponse.data;
        }
      }
      if (duplicatePraise && duplicatePraise.quantifications) {
        const duplicateQuantification = duplicatePraise.quantifications.find(
          (q) => q.quantifier === quantification.quantifier
        );
        if (duplicateQuantification) {
          quantificationExt.duplicateScore =
            duplicateQuantification.score * duplicatePraisePercentage;
        }
      }
    }
  }
  return quantificationExt;
};

export const SinglePraiseExt = selectorFamily({
  key: 'SinglePraiseExt',
  get:
    (praiseId: string) =>
    ({ get }) => {
      const praise = get(SinglePraise(praiseId));
      if (!praise) return undefined;
      const praiseExt = {
        ...praise,
        reason: praise.reason,
      };
      if (praise.quantifications) {
        praiseExt.quantifications = praise.quantifications.map((q) =>
          quantWithDuplicateScore(q, get)
        );
      }
      praiseExt.avgScore = avgPraiseScore(praiseExt);
      return praiseExt;
    },
});

export const AllPraiseList = selectorFamily({
  key: 'AllPraiseList',
  get:
    (listKey: string) =>
    ({ get }) => {
      const praiseIdList = get(AllPraiseIdList(listKey));
      const allPraiseList: Praise[] = [];
      if (!praiseIdList) return undefined;
      for (const praiseId of praiseIdList) {
        const praise = get(SinglePraise(praiseId));
        if (praise) allPraiseList.push(praise);
      }
      return allPraiseList;
    },
});

// The request Id is used to force refresh of AllPraiseQuery
// AllPraiseQuery subscribes to the value. Increase to trigger
// refresh.
export const PraiseRequestId = atom({
  key: 'PraiseRequestId',
  default: 0,
});

export const AllPraiseQuery = selectorFamily<
  AxiosResponse<PaginatedResponseBody<Praise>> | undefined,
  AllPraiseQueryParameters
>({
  key: 'AllPraiseQuery',
  get:
    (query: AllPraiseQueryParameters) =>
    ({ get }): AxiosResponse<PaginatedResponseBody<Praise>> | undefined => {
      if (!query) throw new Error('Invalid query');
      get(PraiseRequestId);
      const qs = Object.keys(query)
        .map((key) => `${key}=${query[key]}`)
        .join('&');
      const response = get(
        ApiAuthGet({ url: `/api/praise/all${qs ? `?${qs}` : ''}` })
      );
      if (isResponseOk(response)) {
        return response;
      }
    },
});

export interface AllPraiseQueryPaginationInterface {
  latestFetchPage: number;
  currentPage: number;
  totalPages: number;
}

export const AllPraiseQueryPagination = atomFamily<
  AllPraiseQueryPaginationInterface,
  string
>({
  key: 'AllPraiseQueryPagination',
  default: {
    latestFetchPage: 1,
    currentPage: 1,
    totalPages: 0,
  },
});

export type AllPraiseQueryParameters = {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
  receiver?: string | null;
};

export const useAllPraiseQuery = (
  queryParams: AllPraiseQueryParameters,
  listKey: string
) => {
  const allPraiseQueryResponse = useAuthApiQuery(AllPraiseQuery(queryParams));
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraiseQueryPagination(listKey)
  );
  const allPraiseIdList = useRecoilValue(AllPraiseIdList(listKey));

  const saveAllPraiseIdList = useRecoilCallback(
    ({ snapshot, set }) =>
      async (praiseList: Praise[]) => {
        const allPraiseIdList = await snapshot.getPromise(
          AllPraiseIdList(listKey)
        );
        const praiseIdList: string[] = [];
        for (const praise of praiseList) {
          praiseIdList.push(praise._id);
        }
        set(
          AllPraiseIdList(listKey),
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
    const data = allPraiseQueryResponse.data as any;
    if (
      typeof allPraiseIdList === 'undefined' ||
      (data.page > praisePagination.latestFetchPage &&
        isResponseOk(allPraiseQueryResponse))
    ) {
      const paginatedResponse = allPraiseQueryResponse.data;
      const praiseList = paginatedResponse.docs;

      if (Array.isArray(praiseList) && praiseList.length > 0) {
        void saveAllPraiseIdList(praiseList);
        saveIndividualPraise(praiseList);
        setPraisePagination({
          ...praisePagination,
          latestFetchPage: data.page,
          totalPages: data.totalPages,
        });
      }
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

type QuantifyPraiseParams = {
  praiseId: string;
  score: number;
  dismissed: boolean;
  duplicatePraise: string;
};

export const QuantifyPraise = selectorFamily({
  key: 'QuantifyPraise',
  get:
    (params: QuantifyPraiseParams) =>
    ({ get }) => {
      const { praiseId, score, dismissed, duplicatePraise } = params;
      const response = get(
        ApiAuthPatch({
          url: `/api/praise/${praiseId}/quantify`,
          data: JSON.stringify({
            score,
            dismissed,
            duplicatePraise,
          }),
        })
      );
      return response;
    },
});

// Hook that returns a function to use for closing a period
export const useQuantifyPraise = () => {
  const quantify = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        praiseId: string,
        score: number,
        dismissed: boolean,
        duplicatePraise: string | null
      ) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/praise/${praiseId}/quantify`,
              data: JSON.stringify({
                score,
                dismissed,
                duplicatePraise,
              }),
            })
          )
        );

        if (isResponseOk(response)) {
          const praise = response.data as Praise;
          set(SinglePraise(praise._id), praise);
          return response.data as Praise;
        }
      }
  );
  return { quantify };
};
