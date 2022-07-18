import {
  PeriodCreateInput,
  PeriodDetailsDto,
  PeriodStatusType,
  PeriodUpdateInput,
  PeriodReplaceQuantifierDto,
  VerifyQuantifierPoolSizeResponse,
} from 'api/dist/period/types';
import { PraiseDto } from 'api/dist/praise/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { toast } from 'react-hot-toast';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { periodQuantifierPraiseListKey } from '@/utils/periods';
import { makeApiAuthClient, useApiAuthClient } from '@/utils/api';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { AccessToken, ActiveUserId } from './auth';
import { AllPraiseList, PraiseIdList, SinglePraise } from './praise';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfPeriod = (object: any): object is PeriodDetailsDto => {
  return '_id' in object;
};

/**
 * Types for `useParams()`
 */
export type PeriodPageParams = {
  periodId: string;
};

/**
 * Types for `useParams()`
 */
export type PeriodAndReceiverPageParams = {
  periodId: string;
  receiverId: string;
};

export const AllPeriods = atom<PeriodDetailsDto[] | undefined>({
  key: 'AllPeriods',
  default: undefined,
  effects: [
    ({ setSelf, trigger, getPromise }): void => {
      if (trigger === 'get') {
        const apiGet = async (): Promise<void> => {
          const accessToken = await getPromise(AccessToken);
          if (!accessToken) return;
          const apiClient = makeApiAuthClient(accessToken);
          const response = await apiClient.get(
            '/periods/all?sortColumn=endDate&sortType=desc'
          );
          if (isResponseOk(response)) {
            const paginatedResponse =
              response.data as PaginatedResponseBody<PeriodDetailsDto>;
            const periods = paginatedResponse.docs;
            if (Array.isArray(periods) && periods.length > 0) {
              setSelf(periods);
            }
          }
        };
        void apiGet();
      }
    },
  ],
});

/**
 * One individual Period
 */
export const SinglePeriod = selectorFamily({
  key: 'SinglePeriod',
  get:
    (periodId: string | undefined) =>
    ({ get }): PeriodDetailsDto | undefined => {
      const allPeriods = get(AllPeriods);
      if (!allPeriods || !periodId) return undefined;
      return allPeriods.filter((period) => period._id === periodId)[0];
    },
  set:
    (periodId: string | undefined) =>
    ({ get, set }, period): PeriodDetailsDto | undefined => {
      const allPeriods = get(AllPeriods);
      if (!periodId || !period || !instanceOfPeriod(period) || !allPeriods)
        return;
      if (allPeriods.find((p) => p._id === period._id)) {
        // Update exisiting period
        set(
          AllPeriods,
          allPeriods.map((p) => (p._id === period._id ? period : p))
        );
        return;
      }
      // Add new period
      set(AllPeriods, [...allPeriods, period]);
    },
});

export const DetailedSinglePeriod = atomFamily<
  PeriodDetailsDto | undefined,
  string
>({
  key: 'DetailedSinglePeriod',
  default: undefined,
  effects: (periodId) => [
    ({ setSelf, trigger, getPromise }): void => {
      if (trigger === 'get') {
        const apiGet = async (): Promise<void> => {
          const accessToken = await getPromise(AccessToken);
          if (!accessToken) return;
          const apiClient = makeApiAuthClient(accessToken);
          const response = await apiClient.get(`/periods/${periodId}`);
          if (isResponseOk(response)) {
            const period = response.data as PeriodDetailsDto;
            setSelf(period);
          }
        };
        void apiGet();
      }
    },
  ],
});

/**
 * Selector to get details for a single period from local state (AllPeriods).
 */
export const SinglePeriodByDate = selectorFamily({
  key: 'SinglePeriodByDate',
  get:
    (anyDate: string | undefined) =>
    ({ get }): PeriodDetailsDto | undefined => {
      const allPeriods = get(AllPeriods);
      if (!allPeriods || !anyDate) return undefined;
      return allPeriods
        .slice()
        .reverse()
        .find((period) => new Date(period.endDate) > new Date(anyDate));
    },
});

type useCreatePeriodReturn = {
  createPeriod: (
    period: PeriodCreateInput
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown> | undefined>;
};

export const useCreatePeriod = (): useCreatePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const createPeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodInput: PeriodCreateInput
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown> | undefined> => {
        const response = await apiAuthClient.post(
          '/admin/periods/create',
          periodInput
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response;
      }
  );

  return { createPeriod };
};

type useUpdatePeriodReturn = {
  updatePeriod: (
    period: PeriodUpdateInput
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};

/**
 * Hook that returns a function to use for updating a period.
 */
export const useUpdatePeriod = (): useUpdatePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const updatePeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodInput: PeriodUpdateInput
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
        const response = await apiAuthClient.patch(
          `/admin/periods/${periodInput._id}/update`,
          periodInput
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response;
      }
  );

  return { updatePeriod };
};

type useClosePeriodReturn = {
  closePeriod: (
    periodId: string
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};

/**
 * Hook that returns a function to use for closing a period.
 */
export const useClosePeriod = (): useClosePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const closePeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodId: string
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
        const response = await apiAuthClient.patch(
          `/admin/periods/${periodId}/close`,
          {}
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response;
      }
  );

  return { closePeriod };
};

/**
 * Quantifier pool size requirements returned by @useVerifyQuantifierPoolSize
 */
// export const PeriodPoolRequirements = atomFamily<
//   VerifyQuantifierPoolSizeResponse | undefined,
//   string
// >({
//   key: 'SinglePeriodPoolRequirements',
//   effects: (periodId) => [
//     ({ setSelf, trigger, getPromise }): void => {
//       console.log(trigger);
//       if (trigger === 'get') {
//         const apiGet = async (): Promise<void> => {
//           const tokenSet = await getPromise(ActiveTokenSet);
//           if (!tokenSet) return;
//           const apiClient = makeApiAuthClient2(tokenSet);
//           const response = await apiClient.get(
//             `/admin/periods/${periodId}/verifyQuantifierPoolSize`
//           );
//           if (isResponseOk(response)) {
//             setSelf(response.data);
//           }
//         };
//         void apiGet();
//       }
//     },
//   ],
// });

export const PeriodPoolRequirements = selectorFamily({
  key: 'SinglePeriodPoolRequirements',
  get:
    (periodId: string) =>
    ({ get }): VerifyQuantifierPoolSizeResponse | undefined => {
      const response = get(
        ApiAuthGet({
          url: `/admin/periods/${periodId}/verifyQuantifierPoolSize`,
        })
      );
      if (isResponseOk(response)) {
        return response.data as VerifyQuantifierPoolSizeResponse;
      }
      response;
    },
});

/**
 * Hook that fetches quantifier pool requirements.
 */
// export const useVerifyQuantifierPoolSize = (periodId: string): void => {
//   const setPeriodPoolRequirements = useSetRecoilState(
//     PeriodPoolRequirements(periodId)
//   );
//   const userRoles = useRecoilValue(ActiveUserRoles);

//   useEffect(() => {
//     const fetchData = async (): Promise<void> => {
//       const apiAuthClient = makeApiAuthClient();

//       const response = await apiAuthClient.get(
//         `/admin/periods/${periodId}/verifyQuantifierPoolSize`
//       );
//       setPeriodPoolRequirements(response.data);
//     };

//     if (userRoles.includes(UserRole.ADMIN)) {
//       void fetchData();
//     }
//   }, [periodId, setPeriodPoolRequirements, userRoles]);
// };

type useAssignQuantifiersReturn = {
  assignQuantifiers: () => Promise<
    AxiosResponse<unknown> | AxiosError<unknown> | undefined
  >;
};

/**
 * Hook that returns function used to assign quantifiers
 */
export const useAssignQuantifiers = (
  periodId: string
): useAssignQuantifiersReturn => {
  const [period, setPeriod] = useRecoilState(SinglePeriod(periodId));

  const saveIndividualPraise = useRecoilCallback(
    ({ set }) =>
      (praiseList: PraiseDto[]): void => {
        praiseList.forEach((praise) => {
          set(SinglePraise(praise._id), praise);
        });
      }
  );

  const assignQuantifiers = useRecoilCallback(
    ({ snapshot }) =>
      async (): Promise<
        AxiosResponse<unknown> | AxiosError<unknown> | undefined
      > => {
        if (!period) return undefined;
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/admin/periods/${periodId}/assignQuantifiers`,
              data: {},
            })
          )
        );
        if (isResponseOk(response)) {
          const praiseList = response.data as PraiseDto[];
          if (Array.isArray(praiseList) && praiseList.length > 0) {
            saveIndividualPraise(praiseList);
          }
          const updatedPeriod: PeriodDetailsDto = {
            ...period,
            status: 'QUANTIFY' as PeriodStatusType,
          };
          setPeriod(updatedPeriod);
          return response;
        }
        throw new Error();
      }
  );
  return { assignQuantifiers };
};

/**
 * Selector that returns all periods where the currently active user is
 * assigned as quantifier,
 */
export const AllActiveUserQuantificationPeriods = selector({
  key: 'AllActiveUserQuantificationPeriods',
  get: ({ get }) => {
    const periods = get(AllPeriods);
    const userId = get(ActiveUserId);
    if (!periods) return undefined;
    const quantificationPeriods: PeriodDetailsDto[] = [];
    periods.forEach((period) => {
      if (period.status === 'QUANTIFY') {
        if (period.quantifiers) {
          period.quantifiers.forEach((quantifier) => {
            if (quantifier._id === userId) quantificationPeriods.push(period);
          });
        }
      }
    });
    return quantificationPeriods;
  },
});

/**
 * Params for @PeriodReceiverPraiseQuery
 */
type PeriodReceiverPraiseQueryParams = {
  periodId: string;
  receiverId: string;
  refreshKey: string | undefined;
};

/**
 * Selector query that fetches all praise received by a user for a period.
 */
const PeriodReceiverPraiseQuery = selectorFamily({
  key: 'PeriodReceiverPraiseQuery',
  get:
    (params: PeriodReceiverPraiseQueryParams) =>
    ({ get }): AxiosResponse<unknown> => {
      const { periodId, receiverId, refreshKey } = params;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/receiverPraise?receiverId=${receiverId}`,
          refreshKey,
        })
      );
    },
});

/**
 * Hook that fetches all praise received by a user for a period.
 */
export const usePeriodReceiverPraiseQuery = (
  periodId: string,
  receiverId: string,
  refreshKey: string | undefined
): PraiseDto[] | undefined => {
  const praiseResponse = useAuthApiQuery(
    PeriodReceiverPraiseQuery({
      periodId,
      receiverId,
      refreshKey,
    })
  );
  const [praiseList, setPraiseList] = React.useState<PraiseDto[] | undefined>(
    undefined
  );
  React.useEffect(() => {
    if (!praiseList && isResponseOk(praiseResponse)) {
      setPraiseList(praiseResponse.data);
    }
  }, [praiseList, praiseResponse]);
  return praiseList;
};

type useExportPraiseReturn = {
  exportPraise: (period: PeriodDetailsDto) => Promise<Blob | undefined>;
};
/**
 * Hook that exports all praise in a period as csv data.
 */
export const useExportPraise = (): useExportPraiseReturn => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);

  const exportPraise = useRecoilCallback(
    ({ snapshot }) =>
      async (period: PeriodDetailsDto): Promise<Blob | undefined> => {
        if (!period || !allPeriods) return undefined;
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthGet({
              url: `/admin/periods/${period._id}/export`,
              config: { responseType: 'blob' },
            })
          )
        );

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          return response.data;
        }
      }
  );
  return { exportPraise };
};

/**
 * Params for PeriodQuantifierPraiseQuery
 */
type PeriodQuantifierPraiseQueryParams = {
  periodId: string;
  refreshKey: string | undefined;
};

/**
 * Query that fetches all praise assigned to the currently active quantifier for a period
 */
const PeriodQuantifierPraiseQuery = selectorFamily({
  key: 'PeriodQuantifierPraiseQuery',
  get:
    (params: PeriodQuantifierPraiseQueryParams) =>
    ({ get }): AxiosResponse<unknown> | AxiosError<unknown> | undefined => {
      const { periodId, refreshKey } = params;
      const quantifierId = get(ActiveUserId);
      if (!periodId || !quantifierId) return undefined;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/quantifierPraise?quantifierId=${quantifierId}`,
          refreshKey,
        })
      );
    },
});

/**
 * Hook to fetch and store all praise assigned to the currently active quantifier for a period
 */
export const usePeriodQuantifierPraiseQuery = (
  periodId: string,
  refreshKey: string | undefined
): AxiosResponse<unknown> | AxiosError<unknown> | undefined => {
  const response = useAuthApiQuery(
    PeriodQuantifierPraiseQuery({
      periodId,
      refreshKey,
    })
  );
  const listKey = periodQuantifierPraiseListKey(periodId);
  const allPraiseIdList = useRecoilValue(PraiseIdList(listKey));

  const saveAllPraiseIdList = useRecoilCallback(
    ({ set }) =>
      (praiseList: PraiseDto[]) => {
        const praiseIdList: string[] = [];
        for (const praise of praiseList) {
          praiseIdList.push(praise._id);
        }
        set(PraiseIdList(listKey), praiseIdList);
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
    if (typeof allPraiseIdList === 'undefined' && isResponseOk(response)) {
      const praiseList: PraiseDto[] = response.data;

      if (Array.isArray(praiseList) && praiseList.length > 0) {
        saveAllPraiseIdList(praiseList);
        saveIndividualPraise(praiseList);
      }
    }
  }, [allPraiseIdList, response, saveAllPraiseIdList, saveIndividualPraise]);
  return response;
};

/**
 * Return format for @PeriodQuantifierReceivers
 */
export interface QuantifierReceiverData {
  periodId: string;
  receiverId: string;
  receiverName: string;
  count: number;
  done: number;
}

/**
 * Period selector that returns @QuantifierReceiverData for all receivers the currently active
 * quantifer have been assigned to.
 */
export const PeriodQuantifierReceivers = selectorFamily({
  key: 'PeriodQuantifierReceivers',
  get:
    (periodId: string) =>
    ({ get }): QuantifierReceiverData[] | undefined => {
      const listKey = periodQuantifierPraiseListKey(periodId);
      const praiseList = get(AllPraiseList(listKey));
      const userId = get(ActiveUserId);
      if (praiseList) {
        const q: QuantifierReceiverData[] = [];

        praiseList.forEach((praiseItem) => {
          if (
            !praiseItem ||
            !praiseItem.quantifications ||
            !praiseItem.receiver._id
          )
            return;
          praiseItem.quantifications.forEach((quantification) => {
            if (quantification.quantifier !== userId) return;

            const qi = q.findIndex(
              (item) => item.receiverId === praiseItem.receiver._id
            );

            const done =
              quantification.score ||
              quantification.dismissed === true ||
              quantification.duplicatePraise
                ? 1
                : 0;

            const qd: QuantifierReceiverData = {
              periodId,
              receiverId: praiseItem.receiver._id,
              receiverName: praiseItem.receiver.name,
              count: qi > -1 ? q[qi].count + 1 : 1,
              done: qi > -1 ? q[qi].done + done : done,
            };

            if (qi > -1) {
              q[qi] = qd;
            } else {
              q.push(qd);
            }
          });
        });

        return q;
      }

      return undefined;
    },
});

/**
 * Params for @PeriodQuantifierReceiver
 */
type PeriodQuantifierReceiverParams = {
  periodId: string;
  receiverId: string;
};

/**
 * Period selector that returns all Praise for a receiver assigned to the
 * currently active quantifier.
 */
export const PeriodQuantifierReceiverPraise = selectorFamily({
  key: 'PeriodQuantifierReceiverPraise',
  get:
    (params: PeriodQuantifierReceiverParams) =>
    ({ get }): PraiseDto[] | undefined => {
      const { periodId, receiverId } = params;
      const userId = get(ActiveUserId);
      const listKey = periodQuantifierPraiseListKey(periodId);
      const praiseList = get(AllPraiseList(listKey));

      if (!praiseList) return undefined;

      return praiseList.filter(
        (praise) =>
          praise &&
          praise.quantifications.findIndex(
            (quant) => quant.quantifier === userId
          ) >= 0 &&
          praise.receiver._id === receiverId
      );
    },
});

type useReplaceQuantifierReturn = {
  replaceQuantifier: (
    currentQuantifierId: string,
    newQuantifierId: string
  ) => Promise<void>;
};

/**
 * Hook that returns function used to assign quantifiers
 */
export const useReplaceQuantifier = (
  periodId: string
): useReplaceQuantifierReturn => {
  const apiAuthClient = useApiAuthClient();

  const replaceQuantifier = useRecoilCallback(
    ({ set }) =>
      async (
        currentQuantifierId: string,
        newQuantifierId: string
      ): Promise<void> => {
        const response: AxiosResponse<PeriodReplaceQuantifierDto> =
          await apiAuthClient.patch(
            `/admin/periods/${periodId}/replaceQuantifier`,
            {
              currentQuantifierId,
              newQuantifierId,
            }
          );

        set(SinglePeriod(response.data.period._id), response.data.period);

        response.data.praises.forEach((praise) => {
          set(SinglePraise(praise._id), praise);
        });
        toast.success('Replaced quantifier and reset their scores');
      }
  );
  return { replaceQuantifier };
};
