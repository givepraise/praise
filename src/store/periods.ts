import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import {
  atom,
  selectorFamily,
  useRecoilCallback,
  useSetRecoilState,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPostQuery,
  getApiResponseOkData,
  useAuthRecoilValue,
} from "./api";

export interface Period {
  id?: number;
  name: string;
  endDate: string;
  totalPraises?: number;
}

// The request Id is used to force refresh of AllPeriodsQuery
// AllPeriodsQuery subscribes to the value. Increase to trigger
// refresh.
const PeriodsRequestId = atom({
  key: "PeriodsRequestId",
  default: 0,
});

// A local only copy of all periods. Used to facilitate CRUD
// without having to make full roundtrips to the server
const AllPeriods = atom({
  key: "AllPeriods",
  default: [] as Period[],
});

// Fetches all periods from the server unless there is a local
// working copy which is then returned instead
export const AllPeriodsQuery: any = selectorFamily({
  key: "AllPeriodsQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      // Subscribe to make request id part of the "call signature"
      get(PeriodsRequestId);

      // If local working copy exists, return that
      const allPeriods = get(AllPeriods);
      if (allPeriods.length > 0) {
        return allPeriods;
      }

      // Else, fetch from server
      const response = get(
        ApiAuthGetQuery({ endPoint: "/api/admin/periods/all" })
      );

      const periods = getApiResponseOkData(response) as Period[];
      if (!periods) return [] as Period[];
      return periods;
    },
  set:
    (params: any) =>
    ({ set, get }, periods) => {
      set(AllPeriods, periods as Period[]);
      set(PeriodsRequestId, get(PeriodsRequestId) + 1);
    },
});

// Stores the api response from the latest call to /api/admin/periods/create
export const CreatePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "PeriodsApiResponse",
  default: null,
});

// Hook that returns a function to use for creating a new period
export const useCreatePeriod = () => {
  const allPeriods: Period[] = useAuthRecoilValue(AllPeriodsQuery({}));
  const setApiResponse = useSetRecoilState(CreatePeriodApiResponse);

  // Clear api response from previous call
  React.useEffect(() => {
    setApiResponse(null);
  });

  const createPeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: Period) => {
        const response = await snapshot.getPromise(
          ApiAuthPostQuery({
            endPoint: "/api/admin/periods/create",
            data: period,
          })
        );

        // If OK response, add returned period object to local state
        const periodData = getApiResponseOkData(response) as Period;
        if (periodData) {
          set(AllPeriodsQuery({}), [...allPeriods, periodData]);
        }
        setApiResponse(response);
        return response;
      }
  );

  return { createPeriod };
};
