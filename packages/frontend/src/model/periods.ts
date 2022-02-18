/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import {
  getPreviousPeriod,
  periodQuantifierPraiseListKey,
} from '@/utils/periods';
import {
  PeriodCreateUpdateInput,
  PeriodDetailsDto,
  PeriodDto,
  PeriodStatusType,
} from 'api/dist/period/types';
import { PraiseDto } from 'api/dist/praise/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiAuthPost,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { ActiveUserId } from './auth';
import { AllPraiseList, PraiseIdList, SinglePraise } from './praise';

/**
 * The full list of praise periods is being fetched on first pageload.
 */
export const AllPeriods = atom<PeriodDetailsDto[] | undefined>({
  key: 'AllPeriods',
  default: undefined,
});

/**
 * Query selector that fetches all praise periods.
 */
export const AllPeriodsQuery = selectorFamily({
  key: 'AllPeriodsQuery',
  get:
    (refreshKey: string | undefined) =>
    ({ get }) => {
      const response = get(
        ApiAuthGet({
          url: '/api/periods/all?sortColumn=endDate&sortType=desc',
          refreshKey,
        })
      );
      return response;
    },
});

/**
 * Hook that fetches all periods and store them to AllPeriods.
 */
export const useAllPeriodsQuery = (
  refreshKey: string | undefined
): AxiosResponse<unknown> => {
  const allPeriodsQueryResponse = useAuthApiQuery(AllPeriodsQuery(refreshKey));
  const [allPeriods, setAllPeriods] = useRecoilState(AllPeriods);

  // Only set AllPeriods if not previously loadedx
  React.useEffect(() => {
    if (
      isResponseOk(allPeriodsQueryResponse) &&
      typeof allPeriods === 'undefined'
    ) {
      const paginatedResponse =
        allPeriodsQueryResponse.data as PaginatedResponseBody<PeriodDetailsDto>;
      const periods = paginatedResponse.docs;
      if (Array.isArray(periods) && periods.length > 0) {
        setAllPeriods(periods);
      }
    }
  }, [allPeriodsQueryResponse, setAllPeriods, allPeriods]);

  return allPeriodsQueryResponse;
};

/**
 * Paramas for SinglePeriodQuery
 */
type SinglePeriodQueryParams = {
  periodId: string;
  refreshKey: string | undefined;
};

/**
 * Query selector that fetches details for a single period.
 */
export const SinglePeriodQuery = selectorFamily({
  key: 'SinglePeriodQuery',
  get:
    (params: SinglePeriodQueryParams) =>
    ({ get }): AxiosResponse<unknown> => {
      const { periodId, refreshKey } = params;
      return get(
        ApiAuthGet({
          url: `/api/periods/${periodId}`,
          refreshKey,
        })
      );
    },
});

/**
 * Hook that fetches details for a single period from the API.
 */
export const useSinglePeriodQuery = (
  periodId: string,
  refreshKey: string | undefined
): PeriodDetailsDto | undefined => {
  const periodResponse = useRecoilValue(
    SinglePeriodQuery({ periodId, refreshKey })
  );
  const [period, setPeriod] = React.useState<PeriodDetailsDto | undefined>(
    undefined
  );
  React.useEffect(() => {
    if (!period && isResponseOk(periodResponse)) {
      setPeriod(periodResponse.data);
    }
  }, [period, periodResponse]);
  return period;
};

/**
 * Selector to get details for a single period from local state (AllPeriods).
 */
export const SinglePeriod = selectorFamily({
  key: 'SinglePeriod',
  get:
    (periodId: string) =>
    ({ get }) => {
      const allPeriods = get(AllPeriods);
      if (!allPeriods) return undefined;
      return allPeriods.find((period) => period._id === periodId);
    },
});

/**
 * Selector to get details for a single period from local state (AllPeriods).
 */
export const SinglePeriodByDate = selectorFamily({
  key: 'SinglePeriodByDate',
  get:
    (anyDate: string | undefined) =>
    ({ get }) => {
      const allPeriods = get(AllPeriods);
      if (!allPeriods || !anyDate) return null;
      return allPeriods
        .slice()
        .reverse()
        .find((period) => new Date(period.endDate) > new Date(anyDate));
    },
});

/**
 * Stores the api response from the latest call to /api/admin/periods/create.
 */
export const CreatePeriodApiResponse = atom<
  void | AxiosResponse<never | any> | AxiosError<never> | null
>({
  key: 'CreatePeriodApiResponse',
  default: null,
});

/**
 * Hook that returns a function to use for creating a new period.
 */
export const useCreatePeriod = () => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);

  const createPeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: PeriodCreateUpdateInput) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPost({
              url: '/api/admin/periods/create',
              data: JSON.stringify(period),
            })
          )
        );
        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const responsePeriod = response.data as PeriodDto;
          if (responsePeriod) {
            if (typeof allPeriods !== 'undefined') {
              set(AllPeriods, [...allPeriods, responsePeriod]);
            } else {
              set(AllPeriods, [responsePeriod]);
            }
          }
        }
        set(CreatePeriodApiResponse, response);
        return response;
      }
  );
  return { createPeriod };
};

/**
 * Stores the api response from the latest call to /api/admin/periods/update.
 */
export const UpdatePeriodApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'UpdatePeriodApiResponse',
  default: null,
});

/**
 * Hook that returns a function to use for updating a period.
 */
export const useUpdatePeriod = () => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);
  const updatePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: PeriodCreateUpdateInput) => {
        if (!period._id) throw new Error('No _id on PeriodDto');
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/admin/periods/${period._id}/update`,
              data: JSON.stringify(period),
            })
          )
        );

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const responsePeriod = response.data as PeriodDto;
          if (responsePeriod) {
            if (typeof allPeriods !== 'undefined') {
              set(
                AllPeriods,
                allPeriods.map(
                  (oldPeriod) =>
                    oldPeriod._id === responsePeriod._id
                      ? responsePeriod
                      : oldPeriod,
                  responsePeriod
                )
              );
            } else {
              set(AllPeriods, [responsePeriod]);
            }
          }
          set(UpdatePeriodApiResponse, response);
        }
        return response;
      }
  );
  return { updatePeriod };
};

/**
 * Stores the api response from the latest call to /api/admin/periods/close.
 */
export const ClosePeriodApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: 'ClosePeriodApiResponse',
  default: null,
});

/**
 * Hook that returns a function to use for closing a period.
 */
export const useClosePeriod = () => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);
  const closePeriod = useRecoilCallback(
    ({ snapshot, set }) =>
      async (periodId: string) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/admin/periods/${periodId}/close`,
              data: JSON.stringify({}),
            })
          )
        );

        if (isResponseOk(response)) {
          const period = response.data as PeriodDto;
          if (period) {
            if (typeof allPeriods !== 'undefined') {
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
          set(UpdatePeriodApiResponse, response);
        }
        return response;
      }
  );
  return { closePeriod };
};

/**
 * Params for VerifyQuantifierPoolSizeQuery
 */
type VerifyQuantifierPoolSizeQueryParams = {
  periodId: string;
  refreshKey: string | undefined;
};

/**
 * Selector query that fetches quantifier pool size requirements.
 */
export const VerifyQuantifierPoolSizeQuery = selectorFamily({
  key: 'VerifyQuantifierPoolSizeQuery',
  get:
    (params: VerifyQuantifierPoolSizeQueryParams) =>
    ({ get }) => {
      const { periodId, refreshKey } = params;
      const response = get(
        ApiAuthGet({
          url: `/api/admin/periods/${periodId}/verifyQuantifierPoolSize`,
          refreshKey,
        })
      );
      return response;
    },
});

/**
 * Quantifier pool size requirements returned by @useVerifyQuantifierPoolSize
 */
export interface PoolRequirements {
  quantifierPoolSize: number;
  requiredPoolSize: number;
}

/**
 * Hook that fetches quantifier pool requirements.
 */
export const useVerifyQuantifierPoolSize = (
  periodId: string,
  refreshKey: string | undefined
): PoolRequirements | undefined => {
  const response = useAuthApiQuery(
    VerifyQuantifierPoolSizeQuery({ periodId, refreshKey })
  );
  const [poolRequirements, setPoolRequirements] = React.useState<
    PoolRequirements | undefined
  >(undefined);

  React.useEffect(() => {
    if (isResponseOk(response)) {
      setPoolRequirements(response.data);
    }
  }, [response]);

  return poolRequirements;
};

/**
 * Hook that returns function used to assign quantifiers
 */
export const useAssignQuantifiers = () => {
  const allPeriods = useRecoilValue(AllPeriods);

  const saveIndividualPraise = useRecoilCallback(
    ({ set }) =>
      (praiseList: PraiseDto[]) => {
        praiseList.forEach((praise) => {
          set(SinglePraise(praise._id), praise);
        });
      }
  );

  const assignQuantifiers = useRecoilCallback(
    ({ snapshot, set }) =>
      async (periodId: string) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/api/admin/periods/${periodId}/assignQuantifiers`,
              data: JSON.stringify({}),
            })
          )
        );
        if (isResponseOk(response)) {
          const praiseList = response.data as PraiseDto[];
          if (Array.isArray(praiseList) && praiseList.length > 0) {
            saveIndividualPraise(praiseList);
          }
          if (allPeriods) {
            set(
              AllPeriods,
              allPeriods.map((period) => {
                if (period._id === periodId) {
                  const newPeriod = {
                    ...period,
                    status: 'QUANTIFY' as PeriodStatusType,
                  };
                  return newPeriod;
                }
                return period;
              })
            );
          }
        }
        return response;
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
          url: `/api/periods/${periodId}/receiverPraise?receiverId=${receiverId}`,
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

/**
 * Hook that exports all praise in a period as csv data.
 */
export const useExportPraise = () => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);

  const exportPraise = useRecoilCallback(
    ({ snapshot, set }) =>
      async (period: PeriodDto) => {
        if (!period || !allPeriods) return null;
        const previousPeriod = getPreviousPeriod(allPeriods, period);
        if (!previousPeriod) throw new Error('Invalid previous start date');
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthGet({
              url: `/api/praise/export/?periodStart=${previousPeriod.endDate}&periodEnd=${period.endDate}`,
              config: { responseType: 'blob' },
            })
          )
        );

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const href = window.URL.createObjectURL(response.data);
          window.location.href = href;
          return href;
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
    ({ get }): AxiosResponse<unknown> | undefined => {
      const { periodId, refreshKey } = params;
      const quantifierId = get(ActiveUserId);
      if (!periodId || !quantifierId) return undefined;
      return get(
        ApiAuthGet({
          url: `/api/periods/${periodId}/quantifierPraise?quantifierId=${quantifierId}`,
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
): AxiosResponse<unknown> | undefined => {
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
      const praiseList: PraiseDto[] = (response as any).data;

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
    ({ get }) => {
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
    ({ get }) => {
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
    ({ get }) => {
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
