import React from "react";
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  isApiResponseOk,
  PaginatedResponseData,
  useAuthApiQuery,
} from "./api";
import { Source } from "./source";
import { UserAccount } from "./users";

export interface Quantification {
  createdAt?: string;
  updatedAt?: string;
  quantifier: string;
  score?: number;
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
  source: Source;
}

// A local only copy of all praises. Used to facilitate CRUD
// without having to make full roundtrips to the server
export const AllPraiseIdList = atom<string[] | undefined>({
  key: "AllPraiseIdList",
  default: undefined,
});

export const SinglePraise = atomFamily<Praise | undefined, string>({
  key: "SinglePraise",
  default: undefined,
});

export const SinglePraiseExt = selectorFamily({
  key: "SinglePraiseExt",
  get:
    (praiseId: string) =>
    async ({ get }) => {
      const praise = get(SinglePraise(praiseId));
      if (!praise) return undefined;
      const praiseExt = {
        ...praise,
        avgScore: avgPraiseScore(praise?.quantifications),
      };
      return praiseExt;
    },
});

export const AllPraiseList = selector({
  key: "AllPraiseList",
  get: async ({ get }) => {
    const praiseIdList = get(AllPraiseIdList);
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
  key: "PraiseRequestId",
  default: 0,
});

export const AllPraiseQuery = selectorFamily({
  key: "AllPraiseQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      get(PraiseRequestId);
      let qs = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");
      const praises = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/all${qs ? `?${qs}` : ""}` })
      );
      return praises;
    },
});

export interface AllPraiseQueryPaginationInterface {
  latestFetchPage: number;
  currentPage: number;
  totalPages: number;
}

export const AllPraiseQueryPagination = atom<AllPraiseQueryPaginationInterface>(
  {
    key: "AllPraiseQueryPagination",
    default: {
      latestFetchPage: 1,
      currentPage: 1,
      totalPages: 0,
    },
  }
);

export interface AllPraiseQueryParameters {
  sortColumn?: string;
  sortType?: string;
  limit?: number;
  page?: number;
}

export const SinglePraiseQuery = selectorFamily({
  key: "SinglePraiseQuery",
  get:
    (praiseId: string) =>
    async ({ get }) => {
      get(PraiseRequestId);
      const praise = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/${praiseId}` })
      );
      return praise;
    },
});

export const useSinglePraiseQuery = (praiseId: string) => {
  const praise = useRecoilValue(SinglePraise(praiseId));

  const fetchSinglePraise = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const response = await snapshot.getPromise(SinglePraiseQuery(praiseId));
        if (isApiResponseOk(response)) {
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

export const useAllPraiseQuery = (queryParams: AllPraiseQueryParameters) => {
  const allPraiseQueryResponse = useAuthApiQuery(AllPraiseQuery(queryParams));
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraiseQueryPagination
  );
  const allPraiseIdList = useRecoilValue(AllPraiseIdList);

  const saveAllPraiseIdList = useRecoilCallback(
    ({ snapshot, set }) =>
      async (praiseList: Praise[]) => {
        const allPraiseIdList = await snapshot.getPromise(AllPraiseIdList);
        const praiseIdList: string[] = [];
        for (const praise of praiseList) {
          praiseIdList.push(praise._id);
        }
        set(
          AllPraiseIdList,
          allPraiseIdList ? allPraiseIdList.concat(praiseIdList) : praiseIdList
        );
      }
  );

  const saveIndividualPraise = useRecoilCallback(
    ({ set }) =>
      async (praiseList: Praise[]) => {
        for (const praise of praiseList) {
          set(SinglePraise(praise._id), praise);
        }
      }
  );

  React.useEffect(() => {
    const data = allPraiseQueryResponse.data as any;
    if (
      typeof allPraiseIdList === "undefined" ||
      (data.page > praisePagination.latestFetchPage &&
        isApiResponseOk(allPraiseQueryResponse))
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

export const avgPraiseScore = (quantifications: any[] | undefined) => {
  if (!quantifications) return 0;
  let score = 0;
  let i = 0;
  for (i; i < quantifications.length; i++) {
    score += quantifications[i].score;
  }
  return Math.round(score / i);
};

export const QuantifyPraise = selectorFamily({
  key: "QuantifyPraise",
  get:
    (params: any) =>
    async ({ get }) => {
      const { praiseId, score, dismissed, duplicatePraise } = params;
      const response = get(
        ApiAuthPatchQuery({
          endPoint: `/api/praise/${praiseId}/quantify`,
          data: {
            score,
            dismissed,
            duplicatePraise,
          },
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
        const response = await snapshot.getPromise(
          ApiAuthPatchQuery({
            endPoint: `/api/praise/${praiseId}/quantify`,
            data: {
              score,
              dismissed,
              duplicatePraise,
            },
          })
        );

        if (isApiResponseOk(response)) {
          const praise = response.data as Praise;
          set(SinglePraise(praise._id), praise);
          return response.data as Praise;
        }
      }
  );
  return { quantify };
};
