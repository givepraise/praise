import React from "react";
import {
  atom,
  selectorFamily,
  useRecoilState,
  useSetRecoilState,
} from "recoil";
import { ApiAuthGetQuery, isApiResponseOk, useAuthApiQuery } from "./api";
import { Source } from "./source";
import { UserAccount } from "./users";

export interface QuantifiedPraise {
  id: number;
}

export interface Praise {
  id: number;
  createdAt: string;
  updatedAt: string;
  periodId?: number;
  reason: string;
  quantifiedPraises?: QuantifiedPraise[];
  giver: UserAccount;
  recipient: UserAccount;
  source: Source;
}

// The request Id is used to force refresh of AllPraisesQuery
// AllPraisesQuery subscribes to the value. Increase to trigger
// refresh.
const PraisesRequestId = atom({
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

export const AllPraisesCurrentPageNumber = atom<number>({
  key: "AllPraisesCurrentPageNumber",
  default: 0,
});
export const AllPraisesLatestPageNumber = atom<number>({
  key: "AllPraisesLatestPageNumber",
  default: 0,
});
export const AllPraisesTotalPages = atom<number>({
  key: "AllPraisesTotalPages",
  default: 0,
});

export const useAllPraisesQuery = (queryParams: AllPraisesQueryParameters) => {
  const allPraisesQueryResponse = useAuthApiQuery(AllPraisesQuery(queryParams));
  const [allPraises, setAllPraises] = useRecoilState(AllPraises);
  const [latestPageNumber, setLatestPageNumber] = useRecoilState(
    AllPraisesLatestPageNumber
  );
  const setTotalPages = useSetRecoilState(AllPraisesTotalPages);

  React.useEffect(() => {
    const data = allPraisesQueryResponse.data as any;
    if (
      (typeof allPraises === "undefined" ||
        data.pageable?.pageNumber > latestPageNumber) &&
      isApiResponseOk(allPraisesQueryResponse)
    ) {
      if (
        data.content &&
        Array.isArray(data.content) &&
        data.content.length > 0
      ) {
        setLatestPageNumber(data.pageable?.pageNumber);
        setTotalPages(data.totalPages);
        setAllPraises(
          allPraises ? allPraises.concat(data.content) : data.content
        );
      }
    }
  }, [
    allPraisesQueryResponse,
    allPraises,
    latestPageNumber,
    setLatestPageNumber,
    setTotalPages,
    setAllPraises,
  ]);

  return allPraisesQueryResponse;
};
