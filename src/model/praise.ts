import React from "react";
import {
  atom,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  isApiResponseError,
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
  avgScore?: number;
}

// The request Id is used to force refresh of AllPraisesQuery
// AllPraisesQuery subscribes to the value. Increase to trigger
// refresh.
export const PraisesRequestId = atom({
  key: "PraisesRequestId",
  default: 0,
});

// A local only copy of all praises. Used to facilitate CRUD
// without having to make full roundtrips to the server
export const AllPraises = atom<Praise[] | undefined>({
  key: "AllPraises",
  default: undefined,
});

interface AllPraisesQueryParameters {
  praiseId?: number;
  periodId?: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export const AllPraisesQuery = selectorFamily({
  key: "AllPraisesQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      get(PraisesRequestId);
      let qs = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");
      const praises = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/all${qs ? `?${qs}` : null}` })
      );
      return praises;
    },
});

export interface AllPraisesQueryPaginationInterface {
  latestFetchPageNumber: number;
  currentPageNumber: number;
  totalPages: number;
}
export const AllPraisesQueryPagination =
  atom<AllPraisesQueryPaginationInterface>({
    key: "AllPraisesQueryPagination",
    default: {
      latestFetchPageNumber: 0,
      currentPageNumber: 0,
      totalPages: 0,
    },
  });

export const useAllPraisesQuery = (queryParams: AllPraisesQueryParameters) => {
  const allPraisesQueryResponse = useAuthApiQuery(AllPraisesQuery(queryParams));
  const [allPraises, setAllPraises] = useRecoilState(AllPraises);
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraisesQueryPagination
  );

  React.useEffect(() => {
    const data = allPraisesQueryResponse.data as any;
    if (
      (typeof allPraises === "undefined" ||
        data.pageable?.pageNumber > praisePagination.latestFetchPageNumber) &&
      isApiResponseOk(allPraisesQueryResponse)
    ) {
      const paginatedResponse =
        allPraisesQueryResponse.data as PaginatedResponseData;
      const praises = paginatedResponse.docs as Praise[];

      if (Array.isArray(praises) && praises.length > 0) {
        setAllPraises(praises);
        // setPraisePagination({
        //   ...praisePagination,
        //   latestFetchPageNumber: data.pageable?.pageNumber,
        //   totalPages: data.totalPages,
        // });
        // setAllPraises(
        //   allPraises ? allPraises.concat(data.content) : data.content
        // );
      }
    }
  }, [
    allPraisesQueryResponse,
    allPraises,
    praisePagination,
    setPraisePagination,
    setAllPraises,
  ]);

  return allPraisesQueryResponse;
};

export const avgPraiseScore = (quantifications: any[] | undefined) => {
  if (!quantifications) return 0;
  return quantifications.reduce((score1, score2) => {
    if (!score1 || !score2) return 0;
    return score1 + score2;
  }, 0);
};

export const SinglePraisesRequestId = atom({
  key: "SinglePraisesRequestId",
  default: 0,
});

export const SinglePraise = selectorFamily({
  key: "SinglePraise",
  get:
    (params: any) =>
    async ({ get }) => {
      const { praiseId } = params;
      get(SinglePraisesRequestId);
      const response = get(
        ApiAuthGetQuery({ endPoint: `/api/praise/${praiseId}` })
      );
      if (!response || isApiResponseError(response)) return undefined;
      const praise: Praise = response.data;
      const extPraise: Praise = {
        ...praise,
        avgScore: avgPraiseScore(praise.quantifications),
      };
      return extPraise as Praise;
    },
});

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
  const singlePraisesRequestId = useRecoilValue(SinglePraisesRequestId);

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
          set(SinglePraisesRequestId, singlePraisesRequestId + 1);
          return response.data as Praise;
        }
      }
  );
  return { quantify };
};
