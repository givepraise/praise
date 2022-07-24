import {
  PeriodCreateInput,
  PeriodDetailsDto,
  PeriodStatusType,
  PeriodUpdateInput,
  PeriodReplaceQuantifierDto,
  VerifyQuantifierPoolSizeResponse,
} from 'api/dist/period/types';
import { PraiseDetailsDto, PraiseDto } from 'api/dist/praise/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import {
  periodQuantifierPraiseListKey,
  periodReceiverPraiseListKey,
} from '@/utils/periods';
import { useApiAuthClient } from '@/utils/api';
import { ApiAuthGet, isResponseOk } from './api';
import { ActiveUserId } from './auth';
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

/**
 * Atom fetching all periods when initialised. `quantifiers`, `receivers`
 * and `settings` are not returned when listing all periods.
 */
export const AllPeriods = atom<PeriodDetailsDto[] | undefined>({
  key: 'AllPeriods',
  default: undefined,
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: '/periods/all?sortColumn=endDate&sortType=desc',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const paginatedResponse =
              response.data as PaginatedResponseBody<PeriodDetailsDto>;
            const periods = paginatedResponse.docs;
            if (Array.isArray(periods) && periods.length > 0) {
              return periods;
            }
          }
        })
      );
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
    ({ get, set }, period): void => {
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

/**
 * Query that fetches the all details for a period, including quantifiers
 * and receivers.
 */
const DetailedSinglePeriodQuery = selectorFamily({
  key: 'DetailedSinglePeriodQuery',
  get:
    (periodId: string) =>
    ({ get }): AxiosResponse<PeriodDetailsDto> | AxiosError => {
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}`,
        })
      ) as AxiosResponse<PeriodDetailsDto> | AxiosError;
    },
});

/**
 * Fetch all details for a period, including quantifiers and receivers.
 * Update period cached in global state.
 */
export const useDetailedSinglePeriod = (
  periodId: string
): AxiosResponse<PeriodDetailsDto> | AxiosError => {
  const response = useRecoilValue(DetailedSinglePeriodQuery(periodId));
  const setPeriod = useSetRecoilState(SinglePeriod(periodId));

  React.useEffect(() => {
    if (isResponseOk(response)) {
      setPeriod(response.data);
    }
  }, [response, setPeriod]);

  return response;
};

type useCreatePeriodReturn = {
  createPeriod: (
    period: PeriodCreateInput
  ) => Promise<AxiosResponse<PraiseDetailsDto> | AxiosError>;
};

export const useCreatePeriod = (): useCreatePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const createPeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodInput: PeriodCreateInput
      ): Promise<AxiosResponse<PraiseDetailsDto> | AxiosError> => {
        const response = await apiAuthClient.post(
          '/admin/periods/create',
          periodInput
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response as AxiosResponse | AxiosError;
      }
  );

  return { createPeriod };
};

type useUpdatePeriodReturn = {
  updatePeriod: (
    period: PeriodUpdateInput
  ) => Promise<AxiosResponse<PraiseDetailsDto> | AxiosError>;
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
      ): Promise<AxiosResponse<PraiseDetailsDto> | AxiosError> => {
        const response = await apiAuthClient.patch(
          `/admin/periods/${periodInput._id}/update`,
          periodInput
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response as AxiosResponse | AxiosError;
      }
  );

  return { updatePeriod };
};

type useClosePeriodReturn = {
  closePeriod: (
    periodId: string
  ) => Promise<AxiosResponse<PeriodDetailsDto> | AxiosError>;
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
      ): Promise<AxiosResponse<PeriodDetailsDto> | AxiosError> => {
        const response = await apiAuthClient.patch(
          `/admin/periods/${periodId}/close`,
          {}
        );
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          set(SinglePeriod(period._id), period);
        }
        return response as AxiosResponse | AxiosError;
      }
  );

  return { closePeriod };
};

/**
 * Quantifier pool size requirements query
 */
export const PeriodPoolRequirementsQuery = selectorFamily({
  key: 'PeriodPoolRequirementsQuery',
  get:
    (periodId: string) =>
    ({ get }): AxiosResponse<VerifyQuantifierPoolSizeResponse> | AxiosError => {
      return get(
        ApiAuthGet({
          url: `/admin/periods/${periodId}/verifyQuantifierPoolSize`,
        })
      ) as AxiosResponse<VerifyQuantifierPoolSizeResponse> | AxiosError;
    },
});

export const PeriodPoolRequirements = selectorFamily({
  key: 'PeriodPoolRequirements',
  get:
    (periodId: string) =>
    ({ get }): VerifyQuantifierPoolSizeResponse | undefined => {
      const response = get(PeriodPoolRequirementsQuery(periodId));
      if (isResponseOk(response)) {
        return response.data;
      }
    },
});

type useAssignQuantifiersReturn = {
  assignQuantifiers: () => Promise<
    AxiosResponse<unknown> | AxiosError | undefined
  >;
};

/**
 * Hook that returns function used to assign quantifiers
 */
export const useAssignQuantifiers = (
  periodId: string
): useAssignQuantifiersReturn => {
  const [period, setPeriod] = useRecoilState(SinglePeriod(periodId));
  const apiAuthClient = useApiAuthClient();

  // const saveIndividualPraise = useRecoilCallback(
  //   ({ set }) =>
  //     (praiseList: PraiseDto[]): void => {
  //       praiseList.forEach((praise) => {
  //         set(SinglePraise(praise._id), praise);
  //       });
  //     }
  // );

  const assignQuantifiers = async (): Promise<
    AxiosResponse<PeriodDetailsDto> | AxiosError | undefined
  > => {
    if (!period) return undefined;
    const response = await apiAuthClient.patch(
      `/admin/periods/${periodId}/assignQuantifiers`,
      {}
    );
    if (isResponseOk(response)) {
      // const praiseList = response.data as PraiseDto[];
      // if (Array.isArray(praiseList) && praiseList.length > 0) {
      //   saveIndividualPraise(praiseList);
      // }
      const updatedPeriod: PeriodDetailsDto = {
        ...period,
        status: 'QUANTIFY' as PeriodStatusType,
      };
      setPeriod(updatedPeriod);
    }
    return response as AxiosResponse | AxiosError;
  };
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
};

/**
 * Selector query that fetches all praise received by a user for a period.
 */
const PeriodReceiverPraiseQuery = selectorFamily({
  key: 'PeriodReceiverPraiseQuery',
  get:
    (params: PeriodReceiverPraiseQueryParams) =>
    ({ get }): AxiosResponse<PraiseDto[]> | AxiosError => {
      const { periodId, receiverId } = params;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/receiverPraise?receiverId=${receiverId}`,
        })
      ) as AxiosResponse<PraiseDto[]> | AxiosError;
    },
});

/**
 * Hook that fetches all praise received by a user for a period.
 */
export const usePeriodReceiverPraise = (
  periodId: string,
  receiverId: string
): AxiosResponse<PraiseDto[]> | AxiosError => {
  const response = useRecoilValue(
    PeriodReceiverPraiseQuery({
      periodId,
      receiverId,
    })
  );

  const listKey = periodReceiverPraiseListKey(receiverId);
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

type useExportPraiseReturn = {
  exportPraise: (period: PeriodDetailsDto) => Promise<Blob | undefined>;
};
/**
 * Hook that exports all praise in a period as csv data.
 */
export const useExportPraise = (): useExportPraiseReturn => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);
  const apiAuthClient = useApiAuthClient();

  const exportPraise = async (
    period: PeriodDetailsDto
  ): Promise<Blob | undefined> => {
    if (!period || !allPeriods) return undefined;
    const response = await apiAuthClient.get(
      `/admin/periods/${period._id}/export`,
      { responseType: 'blob' }
    );

    // If OK response, add returned period object to local state
    if (isResponseOk(response)) {
      return response.data as Blob;
    }
  };

  return { exportPraise };
};

/**
 * Params for PeriodQuantifierPraiseQuery
 */
type PeriodQuantifierPraiseQueryParams = {
  periodId: string;
};

/**
 * Query that fetches all praise assigned to the currently active quantifier for a period
 */
const PeriodQuantifierPraiseQuery = selectorFamily({
  key: 'PeriodQuantifierPraiseQuery',
  get:
    (params: PeriodQuantifierPraiseQueryParams) =>
    ({ get }): AxiosResponse<PraiseDto[]> | AxiosError | undefined => {
      const { periodId } = params;
      const quantifierId = get(ActiveUserId);
      if (!periodId || !quantifierId) return undefined;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/quantifierPraise?quantifierId=${quantifierId}`,
        })
      ) as AxiosResponse<PraiseDto[]> | AxiosError;
    },
});

/**
 * Hook to fetch and store all praise assigned to the currently active quantifier for a period
 */
export const usePeriodQuantifierPraise = (
  periodId: string
): AxiosResponse<PraiseDto[]> | AxiosError | undefined => {
  const response = useRecoilValue(
    PeriodQuantifierPraiseQuery({
      periodId,
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
  ) => Promise<AxiosResponse<PeriodReplaceQuantifierDto> | AxiosError>;
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
      ): Promise<AxiosResponse<PeriodReplaceQuantifierDto> | AxiosError> => {
        const response: AxiosResponse<PeriodReplaceQuantifierDto> =
          await apiAuthClient.patch(
            `/admin/periods/${periodId}/replaceQuantifier`,
            {
              currentQuantifierId,
              newQuantifierId,
            }
          );

        if (isResponseOk(response)) {
          set(SinglePeriod(response.data.period._id), response.data.period);
          response.data.praises.forEach((praise) => {
            set(SinglePraise(praise._id), praise);
          });
        }

        return response;
      }
  );
  return { replaceQuantifier };
};
