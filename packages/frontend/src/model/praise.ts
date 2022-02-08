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
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  ApiQuery,
  isApiResponseAxiosError,
  isResponseOk,
  PaginatedResponseData,
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
      const response = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/${praiseId}` })
      );
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
      fetchSinglePraise();
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
      praiseExt.avgScore = avgPraiseScore(praiseExt, get);
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

export const AllPraiseQuery = selectorFamily({
  key: 'AllPraiseQuery',
  get:
    (params: any) =>
    ({ get }) => {
      get(PraiseRequestId);
      const qs = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&');
      const praises = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/all${qs ? `?${qs}` : ''}` })
      );
      return praises;
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

export interface AllPraiseQueryParameters {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
  receiver?: string | null;
}

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
    if (isApiResponseAxiosError(allPraiseQueryResponse)) return;
    const data = allPraiseQueryResponse.data as any;
    if (
      typeof allPraiseIdList === 'undefined' ||
      (data.page > praisePagination.latestFetchPage &&
        isResponseOk(allPraiseQueryResponse))
    ) {
      const paginatedResponse =
        allPraiseQueryResponse.data as PaginatedResponseData;
      const praiseList = paginatedResponse.docs as Praise[];

      if (Array.isArray(praiseList) && praiseList.length > 0) {
        saveAllPraiseIdList(praiseList);
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

interface QuantifyPraiseParams {
  praiseId: string;
  score: number;
  dismissed: boolean;
  duplicatePraise: string;
}

export const QuantifyPraise = selectorFamily({
  key: 'QuantifyPraise',
  get:
    (params: QuantifyPraiseParams) =>
    ({ get }) => {
      const { praiseId, score, dismissed, duplicatePraise } = params;
      const response = get(
        ApiAuthPatchQuery({
          endPoint: `/api/praise/${praiseId}/quantify`,
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
            ApiAuthPatchQuery({
              endPoint: `/api/praise/${praiseId}/quantify`,
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
