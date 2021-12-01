import { compareAsc } from "date-fns";
import React from "react";
import { atom, selector, useRecoilState } from "recoil";
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

export const AllPraisesQuery = selector({
  key: "AllPraisesQuery",
  get: async ({ get }) => {
    get(PraisesRequestId);
    const praises = get(
      ApiAuthGetQuery({ endPoint: "/api/praise/all" })
    );    
    return praises;
  },
});

export const useAllPraisesQuery = () => {
  const allPraisesQueryResponse = useAuthApiQuery(AllPraisesQuery);
  const [allPraises, setAllPraises] = useRecoilState(AllPraises);

  // Only set AllPraises if not previously loaded
  React.useEffect(() => {
    if (
      isApiResponseOk(allPraisesQueryResponse) &&
      typeof allPraises === "undefined"
    ) {          
      const data = allPraisesQueryResponse.data as any;
          
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {        
        // TODO API should return praises sorted by createdAt
        const sortedPraises = [...data.content].sort((a, b) =>
          compareAsc(new Date(a.createdAt), new Date(b.createdAt))
        );
        setAllPraises(sortedPraises);        
      }      
    }
  }, [allPraisesQueryResponse, setAllPraises, allPraises]);

  return allPraisesQueryResponse;
};
