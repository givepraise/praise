import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  ApiAuthPostQuery,
  isApiErrorData,
  isApiResponseOk,
  PaginatedResponseData,
  useAuthApiQuery,
} from "./api";

export interface Period {
  _id?: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  status?: string;
  endDate: string;
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
    const periods = get(ApiAuthGetQuery({ endPoint: "/api/periods/all" }));
    return periods;
  },
});

export const SinglePeriod = selectorFamily({
  key: "SinglePeriod",
  get:
    (params: any) =>
    async ({ get }) => {
      const allPeriods = get(AllPeriods);
      if (!allPeriods) return null;
      return allPeriods.filter((period) => period._id === params.id)[0];
    },
});

// Stores the api response from the latest call to /api/admin/periods/create
export const CreatePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "CreatePeriodApiResponse",
  default: null,
});

// Stores the api response from the latest call to /api/admin/periods/update
export const UpdatePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "UpdatePeriodApiResponse",
  default: null,
});

// Stores the api response from the latest call to /api/admin/periods/close
export const ClosePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "ClosePeriodApiResponse",
  default: null,
});

export const useAllPeriodsQuery = () => {
  const allPeriodsQueryResponse = useAuthApiQuery(AllPeriodsQuery);
  const [allPeriods, setAllPeriods] = useRecoilState(AllPeriods);

  console.log(allPeriodsQueryResponse);
  // Only set AllPeriods if not previously loaded
  React.useEffect(() => {
    if (
      isApiResponseOk(allPeriodsQueryResponse) &&
      typeof allPeriods === "undefined"
    ) {
      const paginatedResponse =
        allPeriodsQueryResponse.data as PaginatedResponseData;
      const periods = paginatedResponse.docs as Period[];
      if (Array.isArray(periods) && periods.length > 0) {
        // TODO API should return periods sorted by endDate
        // const sortedPeriods = [...periods].sort((a, b) =>
        //   compareAsc(new Date(a.endDate), new Date(b.endDate))
        // );
        setAllPeriods(periods);
      }
    }
  }, [allPeriodsQueryResponse, setAllPeriods, allPeriods]);

  return allPeriodsQueryResponse;
};

// Hook that returns a function to use for creating a new period
export const useCreatePeriod = () => {
  const allPeriods: Period[] | undefined = useRecoilValue(AllPeriods);

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

// Hook that returns a function to use for renaming a period
export const useRenamePeriod = () => {
  const allPeriods: Period[] | undefined = useRecoilValue(AllPeriods);
  const renamePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: Period) => {
        const response = await snapshot.getPromise(
          ApiAuthPatchQuery({
            endPoint: `/api/admin/periods/${period.id}/rename?name=${period.name}`,
            data: period,
          })
        );

        // If OK response, add returned period object to local state
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const period = response.data as Period;
          if (period) {
            if (typeof allPeriods !== "undefined") {
              set(
                AllPeriods,
                allPeriods.map(
                  (oldPeriod) =>
                    oldPeriod.id === period.id ? period : oldPeriod,
                  period
                )
              );
            } else {
              set(AllPeriods, [period]);
            }
          }
        }
        set(UpdatePeriodApiResponse, response);
        return response;
      }
  );
  return { renamePeriod };
};

/** TODO: modify function to update period endDate */
export const useUpdatePeriod = () => {
  const allPeriods: Period[] | undefined = useRecoilValue(AllPeriods);
  const updatePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: Period) => {
        const response = await snapshot.getPromise(
          //TODO Dont forget to add auth befor production!
          ApiAuthPatchQuery({
            endPoint: `/api/periods/${period._id}/update?name=${period.name}`,
          })
        );

        // If OK response, add returned period object to local state
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const period = response.data as Period;
          if (period) {
            if (typeof allPeriods !== "undefined") {
              set(
                AllPeriods,
                allPeriods.map(
                  (oldPeriod) =>
                    oldPeriod._id === period._id ? period : oldPeriod,
                  period
                )
              );
            } else {
              set(AllPeriods, [period]);
            }
          }
        }
        set(UpdatePeriodApiResponse, response);
        return response;
      }
  );
  return { updatePeriod };
};

// Hook that returns a function to use for closing a period
export const useClosePeriod = () => {
  const allPeriods: Period[] | undefined = useRecoilValue(AllPeriods);
  const closePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: Period) => {
        const response = await snapshot.getPromise(
          //TODO Dont forget to add auth befor production!
          ApiAuthPatchQuery({
            endPoint: `/api/periods/${period._id}/close`,
          })
        );

        // If OK response, add returned period object to local state
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const period = response.data as Period;
          if (period) {
            if (typeof allPeriods !== "undefined") {
              set(
                AllPeriods,
                allPeriods.map(
                  (oldPeriod) =>
                    oldPeriod._id === period._id ? period : oldPeriod,
                  period
                )
              );
            } else {
              set(AllPeriods, [period]);
            }
          }
        }
        set(UpdatePeriodApiResponse, response);
        return response;
      }
  );
  return { closePeriod };
};
