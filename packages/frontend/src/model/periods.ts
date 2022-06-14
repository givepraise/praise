/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { UserRole } from 'types/dist/user';
import { makeApiAuthClient } from '@/utils/api';
import { periodQuantifierPraiseListKey } from '@/utils/periods';
import {
  PeriodCreateInput,
  PeriodDetailsDto,
  PeriodStatusType,
  PeriodUpdateInput,
} from 'types/dist/period';
import { PraiseDto } from 'types/dist/praise';
import { PaginatedResponseBody } from 'types/dist/query';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useEffect } from 'react';
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiAuthPost,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { ActiveUserId, ActiveUserRoles } from './auth';
import { SinglePeriodSetting } from './periodsettings';
import { AllPraiseList, PraiseIdList, SinglePraise } from './praise';

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
 * One individual Period
 */
export const SinglePeriod = atomFamily<PeriodDetailsDto | undefined, string>({
  key: 'SinglePeriod',
  default: undefined,
});

/**
 * The full list of period Ids
 */
export const AllPeriodIds = atom<string[] | undefined>({
  key: 'PeriodIdList',
  default: undefined,
});

/**
 * Return a list of Period objects based on the ids in @AllPeriodIds
 */
export const AllPeriods = selector({
  key: 'AllPeriods',
  get: ({ get }): PeriodDetailsDto[] | undefined => {
    const allPeriodIds = get(AllPeriodIds);
    if (!allPeriodIds) return undefined;
    const allPeriods: PeriodDetailsDto[] = [];
    for (const periodId of allPeriodIds) {
      const period = get(SinglePeriod(periodId));
      if (period) {
        allPeriods.push(period);
      }
    }
    return allPeriods;
  },
});

/**
 * Hook that fetches details for a single period from the API.
 */
export const useSinglePeriodQuery = (periodId: string): void => {
  const setPeriod = useSetRecoilState(SinglePeriod(periodId));

  useEffect(() => {
    const fetchPeriod = async (periodId): Promise<void> => {
      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get(`/periods/${periodId}`);
      setPeriod(response.data);
    };

    void fetchPeriod(periodId);
  }, [periodId, setPeriod]);
};

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
 * Query selector that fetches all praise periods from the API.
 */
export const AllPeriodsQuery = selector({
  key: 'AllPeriodsQuery',
  get: ({ get }): AxiosResponse<unknown> => {
    const response = get(
      ApiAuthGet({
        url: '/periods/all?sortColumn=endDate&sortType=desc',
      })
    );
    return response;
  },
});

/**
 * Hook that fetches all periods. Period Ids are stored in @AllPeriods , each Period object is
 * stored individually in @SinglePeriod .
 */
export const useAllPeriodsQuery = (): AxiosResponse<unknown> => {
  const allPeriodsQueryResponse = useAuthApiQuery(AllPeriodsQuery);
  const allPeriodsIds = useRecoilValue(AllPeriodIds);

  const saveAllPeriods = useRecoilCallback(
    ({ set, snapshot }) =>
      (periods: PeriodDetailsDto[]) => {
        const periodIds: string[] = [];
        for (const period of periods) {
          periodIds.push(period._id);
          const oldPeriod = snapshot.getLoadable(
            SinglePeriod(period._id)
          ).contents;
          if (oldPeriod) {
            set(SinglePeriod(period._id), { ...oldPeriod, ...period });
          } else {
            set(SinglePeriod(period._id), period);
          }

          if (period.settings) {
            for (const setting of period.settings) {
              set(SinglePeriodSetting(period._id), setting);
            }
          }
        }
        set(AllPeriodIds, periodIds);
      }
  );

  // Only set AllPeriods if not previously loaded
  React.useEffect(() => {
    if (
      isResponseOk(allPeriodsQueryResponse) &&
      typeof allPeriodsIds === 'undefined'
    ) {
      const paginatedResponse =
        allPeriodsQueryResponse.data as PaginatedResponseBody<PeriodDetailsDto>;
      const periods = paginatedResponse.docs;
      if (Array.isArray(periods) && periods.length > 0) {
        void saveAllPeriods(periods);
      }
    }
  }, [allPeriodsQueryResponse, allPeriodsIds, saveAllPeriods]);

  return allPeriodsQueryResponse;
};

/**
 * Stores the api response from the latest call to /api/admin/periods/create.
 */
export const CreatePeriodApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'CreatePeriodApiResponse',
  default: null,
});

type useCreatePeriodReturn = {
  createPeriod: (
    period: PeriodCreateInput
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};
/**
 * Hook that returns a function to use for creating a new period.
 */
export const useCreatePeriod = (): useCreatePeriodReturn => {
  const [allPeriodIds, setAllPeriodIds] = useRecoilState(AllPeriodIds);

  const createPeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        period: PeriodCreateInput
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPost({
              url: '/admin/periods/create',
              data: { ...period },
            })
          )
        );
        // If OK response, save returned period object to local state
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          if (period) {
            set(SinglePeriod(period._id), period);
            if (allPeriodIds) {
              const newAllPeriodIds: string[] = [period._id, ...allPeriodIds];
              setAllPeriodIds(newAllPeriodIds);
            } else {
              setAllPeriodIds([period._id]);
            }
          }
        }
        set(CreatePeriodApiResponse, response);
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
  const updatePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        period: PeriodUpdateInput
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/admin/periods/${period._id}/update`,
              data: { ...period },
            })
          )
        );

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;
          if (period) {
            set(SinglePeriod(period._id), period);
          }
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
  const closePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (
        periodId: string
      ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/admin/periods/${periodId}/close`,
              data: {},
            })
          )
        );

        if (isResponseOk(response)) {
          const period = response.data as PeriodDetailsDto;

          if (period) {
            set(SinglePeriod(period._id), period);
          }
        }
        return response;
      }
  );
  return { closePeriod };
};

/**
 * Quantifier pool size requirements returned by @useVerifyQuantifierPoolSize
 */
export interface PoolRequirements {
  quantifierPoolSize: number;
  quantifierPoolSizeNeeded: number;
  quantifierPoolDeficitSize: number;
}

export const PeriodPoolRequirements = atomFamily<
  PoolRequirements | undefined,
  string
>({
  key: 'SinglePeriodPoolRequirements',
  default: undefined,
});

/**
 * Hook that fetches quantifier pool requirements.
 */
export const useVerifyQuantifierPoolSize = (periodId: string): void => {
  const setPeriodPoolRequirements = useSetRecoilState(
    PeriodPoolRequirements(periodId)
  );
  const userRoles = useRecoilValue(ActiveUserRoles);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const apiAuthClient = makeApiAuthClient();

      const response = await apiAuthClient.get(
        `/admin/periods/${periodId}/verifyQuantifierPoolSize`
      );
      setPeriodPoolRequirements(response.data);
    };

    if (userRoles.includes(UserRole.ADMIN)) {
      void fetchData();
    }
  }, [periodId, setPeriodPoolRequirements, userRoles]);
};

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
export const PeriodReceiverPraiseQuery = selectorFamily({
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
export const PeriodQuantifierPraiseQuery = selectorFamily({
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
 * Period selector that returns @QuantifierReceiverData for a  receiver
 * assigned to the currently active quantifier.
 */
export const PeriodQuantifierReceiver = selectorFamily({
  key: 'PeriodQuantifierReceiver',
  get:
    (params: PeriodQuantifierReceiverParams) =>
      ({ get }): QuantifierReceiverData | undefined => {
        const { periodId, receiverId } = params;
        const qrd = get(PeriodQuantifierReceivers(periodId));
        if (!qrd) return undefined;
        return qrd.find((item) => item.receiverId === receiverId);
      },
});

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
