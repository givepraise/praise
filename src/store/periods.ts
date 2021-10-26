import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import {
  atom,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPostQuery,
  isApiErrorData,
  isApiResponseOk,
  useAuthApiQuery,
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
export const AllPeriods = atom<Period[] | undefined>({
  key: "AllPeriods",
  default: undefined,
});

export const AllPeriodsQuery = selector({
  key: "AllPeriodsQuery",
  get: async ({ get }) => {
    get(PeriodsRequestId);
    const periods = get(
      ApiAuthGetQuery({ endPoint: "/api/admin/periods/all" })
    );
    return periods;
  },
});

// Stores the api response from the latest call to /api/admin/periods/create
export const CreatePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "PeriodsApiResponse",
  default: null,
});

export const useAllPeriodsQuery = () => {
  const allPeriodsQueryResponse = useAuthApiQuery(AllPeriodsQuery);
  const [allPeriods, setAllPeriods] = useRecoilState(AllPeriods);

  // Only set AllPeriods if not previously loaded
  React.useEffect(() => {
    if (
      isApiResponseOk(allPeriodsQueryResponse) &&
      typeof allPeriods === "undefined"
    ) {
      const periods = allPeriodsQueryResponse.data as Period[];
      if (Array.isArray(periods) && periods.length > 0) setAllPeriods(periods);
    }
  }, [allPeriodsQueryResponse, setAllPeriods, allPeriods]);

  return allPeriodsQueryResponse;
};

// Hook that returns a function to use for creating a new period
export const useCreatePeriod = () => {
  const allPeriods: Period[] | undefined = useRecoilValue(AllPeriods);
  const setApiResponse = useSetRecoilState(CreatePeriodApiResponse);

  //Clear api response from previous call
  React.useEffect(() => {
    setApiResponse(null);
  }, [setApiResponse]);

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
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const period = response.data as Period;
          if (period) {
            if (typeof allPeriods !== "undefined") {
              set(AllPeriods, [...allPeriods, period]);
            } else {
              set(AllPeriods, [period]);
            }
          }
        }
        set(CreatePeriodApiResponse, response);
        return response;
      }
  );

  return { createPeriod };
};
