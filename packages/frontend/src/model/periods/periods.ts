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

import {
  periodGiverPraiseListKey,
  periodQuantifierPraiseListKey,
  periodReceiverPraiseListKey,
} from '@/utils/periods';
import { useApiAuthClient } from '@/utils/api';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { ActiveUserId } from '../auth/auth';
import { AllPraiseList, PraiseIdList, SinglePraise } from '../praise/praise';
import { PraiseDto } from '../praise/praise.dto';
import { UserAccountDto } from '../useraccount/useraccount.dto';
import { PeriodDetailsDto } from './dto/period-details.dto';
import { PeriodCreateInput } from './dto/period-create.dto';
import { PeriodUpdateInput } from './dto/period-update-input.dto';
import { PeriodStatusType } from './enums/period-status-type.enum';
import { VerifyQuantifierPoolSizeResponseDto } from './dto/verify-quantifier-pool-size-reponse.dto';
import { PeriodReplaceQuantifierInputDto } from './dto/period-replace-quantifier-input.dto';
import { PaginatedResponseBodyDto } from '@/model/shared/dto/paginated-response-body.dto';
import { isDateEqualOrAfter } from '@/utils/date';
import { PeriodDetailsQuantifierDto } from './dto/period-details-quantifier.dto';

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
 * Types for `useParams()`
 */
export type PeriodAndGiverPageParams = {
  periodId: string;
  giverId: string;
};

/**
 * Types for `useParams()`
 */
export type PeriodAndQuantifierPageParams = {
  periodId: string;
  quantifierId: string;
};

/**
 * Atom that fetches all periods when initialised. `quantifiers`, `receivers`
 * and `settings` are not returned but need to be separately loaded using
 * @DetailedSinglePeriodQuery
 */
export const AllPeriods = atom<PeriodDetailsDto[]>({
  key: 'AllPeriods',
  default: [],
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: '/periods?sortColumn=endDate&sortType=desc',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const paginatedResponse =
              response.data as PaginatedResponseBodyDto<PeriodDetailsDto>;
            const periods = paginatedResponse.docs;
            if (Array.isArray(periods) && periods.length > 0) {
              return periods;
            }
          }
          return [];
        })
      );
    },
  ],
});

export const AllPeriodPraise = atomFamily<PraiseDto[] | undefined, string>({
  key: 'AllPeriodPraise',
  default: undefined,
  effects: (periodId) => [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: `/periods/${periodId}/praise`,
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const praiseDetails = response.data as PraiseDto[];
            if (Array.isArray(praiseDetails) && praiseDetails.length > 0)
              return praiseDetails;
          }
        })
      );
    },
  ],
});

/**
 * Selector that returns one individual Period.
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
export const useLoadSinglePeriodDetails = (
  periodId: string
): AxiosResponse<PeriodDetailsDto> | AxiosError => {
  const response = useRecoilValue(DetailedSinglePeriodQuery(periodId));
  const [period, setPeriod] = useRecoilState(SinglePeriod(periodId));

  React.useEffect(() => {
    if (
      isResponseOk(response) &&
      (!period || isDateEqualOrAfter(response.data.updatedAt, period.updatedAt))
    ) {
      setPeriod(response.data);
    }
  }, [response, period, setPeriod]);

  return response;
};

type useCreatePeriodReturn = {
  createPeriod: (
    period: PeriodCreateInput
  ) => Promise<AxiosResponse<PraiseDto> | AxiosError>;
};

/**
 * Returns one quantifier for a given period.
 */
export const useSingleQuantifier = (
  periodId: string,
  quantifierId: string
): PeriodDetailsQuantifierDto | undefined => {
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period || !period.quantifiers) return undefined;
  return period.quantifiers.find((q) => q._id === quantifierId);
};

/**
 * Returns function used to create a period.
 */
export const useCreatePeriod = (): useCreatePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const createPeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodInput: PeriodCreateInput
      ): Promise<AxiosResponse<PraiseDto> | AxiosError> => {
        const response = await apiAuthClient.post('/periods', periodInput);
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
  ) => Promise<AxiosResponse<PraiseDto> | AxiosError>;
};

/**
 * Returns function used to update a period.
 */
export const useUpdatePeriod = (): useUpdatePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const updatePeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodInput: PeriodUpdateInput
      ): Promise<AxiosResponse<PraiseDto> | AxiosError> => {
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
 * Returns function used to close a period.
 */
export const useClosePeriod = (): useClosePeriodReturn => {
  const apiAuthClient = useApiAuthClient();

  const closePeriod = useRecoilCallback(
    ({ set }) =>
      async (
        periodId: string
      ): Promise<AxiosResponse<PeriodDetailsDto> | AxiosError> => {
        const response = await apiAuthClient.patch(
          `/periods/${periodId}/close`,
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
 * Fetches pool size requirements, including pool size needed, deficit
 * size, etc.
 * @returns Full response/error returned by server.
 */
export const PeriodPoolRequirementsQuery = selectorFamily({
  key: 'PeriodPoolRequirementsQuery',
  get:
    (periodId: string) =>
    ({
      get,
    }): AxiosResponse<VerifyQuantifierPoolSizeResponseDto> | AxiosError => {
      return get(
        ApiAuthGet({
          url: `/admin/periods/${periodId}/verifyQuantifierPoolSize`,
        })
      ) as AxiosResponse<VerifyQuantifierPoolSizeResponseDto> | AxiosError;
    },
});

/**
 * Fetches pool size requirements, including pool size needed, deficit
 * size, etc.
 * @returns Pool size requirements if query was successful.
 */
export const PeriodPoolRequirements = selectorFamily({
  key: 'PeriodPoolRequirements',
  get:
    (periodId: string) =>
    ({ get }): VerifyQuantifierPoolSizeResponseDto | undefined => {
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
 * Returns function used to assign quantifiers
 */
export const useAssignQuantifiers = (
  periodId: string
): useAssignQuantifiersReturn => {
  const [period, setPeriod] = useRecoilState(SinglePeriod(periodId));
  const apiAuthClient = useApiAuthClient();

  const assignQuantifiers = async (): Promise<
    AxiosResponse<PeriodDetailsDto> | AxiosError | undefined
  > => {
    if (!period) return undefined;
    const response = await apiAuthClient.patch(
      `/admin/periods/${periodId}/assignQuantifiers`,
      {}
    );
    if (isResponseOk(response)) {
      const updatedPeriod: PeriodDetailsDto = {
        ...period,
        status: 'QUANTIFY' as PeriodStatusType,
      };
      setPeriod(updatedPeriod);
      return response as AxiosResponse<PeriodDetailsDto>;
    }
    if (isApiResponseAxiosError(response)) {
      throw response;
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

const useSaveGiverReceiverPraiseItems = (
  response: AxiosResponse<PraiseDto[]> | AxiosError,
  listKey: string
): void => {
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
};

/**
 * Params for @PeriodReceiverPraiseQuery
 */
type PeriodReceiverPraiseQueryParams = {
  periodId: string;
  receiverId: string;
};

/**
 * Fetches all praise received by a user for a period.
 */
const PeriodReceiverPraiseQuery = selectorFamily({
  key: 'PeriodReceiverPraiseQuery',
  get:
    (params: PeriodReceiverPraiseQueryParams) =>
    ({ get }): AxiosResponse<PraiseDto[]> | AxiosError => {
      const { periodId, receiverId } = params;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/praise/receiver/${receiverId}`,
        })
      ) as AxiosResponse<PraiseDto[]> | AxiosError;
    },
});

/**
 * Fetches all praise received by a user for a period. Saves praise items
 * to global state and creates a Praise Id list with the name
 * `PERIOD_RECEIVER_PRAISE_[periodId]_[receiverId]`.
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

  const listKey = periodReceiverPraiseListKey(periodId, receiverId);
  useSaveGiverReceiverPraiseItems(response, listKey);

  return response;
};

/**
 * Params for @PeriodGiverPraiseQuery
 */
type PeriodGiverPraiseQueryParams = {
  periodId: string;
  giverId: string;
};

/**
 * Fetches all praise given by a user for a period.
 */
const PeriodGiverPraiseQuery = selectorFamily({
  key: 'PeriodGiverPraiseQuery',
  get:
    (params: PeriodGiverPraiseQueryParams) =>
    ({ get }): AxiosResponse<PraiseDto[]> | AxiosError => {
      const { periodId, giverId } = params;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/praise/giver/${giverId}`,
        })
      ) as AxiosResponse<PraiseDto[]> | AxiosError;
    },
});

/**
 * Fetches all praise given by a user for a period. Saves praise items
 * to global state and creates a Praise Id list with the name
 * `PERIOD_GIVER_PRAISE_[periodId]_[giverId]`.
 */
export const usePeriodGiverPraise = (
  periodId: string,
  giverId: string
): AxiosResponse<PraiseDto[]> | AxiosError => {
  const response = useRecoilValue(
    PeriodGiverPraiseQuery({
      periodId,
      giverId,
    })
  );

  const listKey = periodGiverPraiseListKey(periodId, giverId);
  useSaveGiverReceiverPraiseItems(response, listKey);

  return response;
};

type useExportPraiseReturn = {
  exportPraiseFull: (period: PeriodDetailsDto) => Promise<Blob | undefined>;
  exportPraiseSummary: (period: PeriodDetailsDto) => Promise<Blob | undefined>;
  exportPraiseCustom: (
    period: PeriodDetailsDto,
    exportContext: string
  ) => Promise<Blob | undefined>;
};

/**
 * Returns function that exports all praise in a period as csv data.
 */
export const useExportPraise = (): useExportPraiseReturn => {
  const allPeriods: PeriodDetailsDto[] | undefined = useRecoilValue(AllPeriods);
  const apiAuthClient = useApiAuthClient();

  const exportPraiseFull = async (
    period: PeriodDetailsDto
  ): Promise<Blob | undefined> => {
    if (!period || !allPeriods) return undefined;
    const response = await apiAuthClient.get(
      `/admin/periods/${period._id}/exportFull`,
      { responseType: 'blob' }
    );

    // If OK response, add returned period object to local state
    if (!isResponseOk(response)) {
      throw new Error();
    }
    return response.data as Blob;
  };

  const exportPraiseSummary = async (
    period: PeriodDetailsDto
  ): Promise<Blob | undefined> => {
    if (!period || !allPeriods) return undefined;
    const response = await apiAuthClient.get(
      `/admin/periods/${period._id}/exportSummary`,
      { responseType: 'blob' }
    );

    // If OK response, add returned period object to local state
    if (!isResponseOk(response)) {
      throw new Error();
    }
    return response.data as Blob;
  };

  const exportPraiseCustom = async (
    period: PeriodDetailsDto,
    exportContext: string
  ): Promise<Blob | undefined> => {
    if (!period) return undefined;

    try {
      const context = JSON.parse(exportContext);

      const response = await apiAuthClient.get(
        `/admin/periods/${period._id}/exportCustom`,
        { responseType: 'blob', params: context }
      );

      // If OK response, add returned period object to local state
      if (!isResponseOk(response)) {
        throw new Error();
      }
      return response.data as Blob;
    } catch (error) {
      throw new Error('Invalid export context');
    }
  };

  return { exportPraiseFull, exportPraiseSummary, exportPraiseCustom };
};

/**
 * Params for PeriodQuantifierPraiseQuery
 */
type PeriodQuantifierPraiseQueryParams = {
  periodId: string;
  quantifierId: string;
};

/**
 * Query that fetches all praise assigned to the currently active quantifier for a period
 */
const PeriodQuantifierPraiseQuery = selectorFamily({
  key: 'PeriodQuantifierPraiseQuery',
  get:
    (params: PeriodQuantifierPraiseQueryParams) =>
    ({ get }): AxiosResponse<PraiseDto[]> | AxiosError | undefined => {
      const { periodId, quantifierId } = params;
      if (!periodId || !quantifierId) return undefined;
      return get(
        ApiAuthGet({
          url: `/periods/${periodId}/praise/quantifier/${quantifierId}`,
        })
      ) as AxiosResponse<PraiseDto[]> | AxiosError;
    },
});

/**
 * Fetches all praise assigned to the currently active quantifier for a period.
 * Saves praise items to global state and creates a Praise Id list with the name
 * `PERIOD_QUANTIFIER_PRAISE_[periodId]_[quantifierId]`.
 */
export const usePeriodQuantifierPraise = (
  periodId: string,
  quantifierId: string
): AxiosResponse<PraiseDto[]> | AxiosError | undefined => {
  const response = useRecoilValue(
    PeriodQuantifierPraiseQuery({
      periodId,
      quantifierId,
    })
  );
  const listKey = periodQuantifierPraiseListKey(periodId, quantifierId);
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
 * Params for @PeriodQuantifierReceivers
 */
type PeriodQuantifierReceiversParams = {
  periodId: string;
  quantifierId: string;
};

/**
 * Return format for @PeriodQuantifierReceivers
 */
export interface QuantifierReceiverData {
  periodId: string;
  receiver: UserAccountDto;
  count: number;
  done: number;
}

/**
 * Selector that returns @QuantifierReceiverData for all receivers the currently active
 * quantifer have been assigned to.
 */
export const PeriodQuantifierReceivers = selectorFamily({
  key: 'PeriodQuantifierReceivers',
  get:
    ({ periodId, quantifierId }: PeriodQuantifierReceiversParams) =>
    ({ get }): QuantifierReceiverData[] | undefined => {
      const listKey = periodQuantifierPraiseListKey(periodId, quantifierId);
      const praiseList = get(AllPraiseList(listKey));
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
            if (quantification.quantifier !== quantifierId) return;

            const qi = q.findIndex(
              (item) => item.receiver._id === praiseItem.receiver._id
            );

            const done =
              quantification.score ||
              quantification.dismissed === true ||
              quantification.duplicatePraise
                ? 1
                : 0;

            const qd: QuantifierReceiverData = {
              periodId,
              receiver: praiseItem.receiver,
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
 * Params for @PeriodQuantifierReceiverPraise
 */
type PeriodQuantifierReceiverPraiseParams = {
  periodId: string;
  receiverId: string;
};

/**
 * Selector that returns all Praise for a receiver assigned to the
 * currently active quantifier.
 */
export const PeriodQuantifierReceiverPraise = selectorFamily({
  key: 'PeriodQuantifierReceiverPraise',
  get:
    (params: PeriodQuantifierReceiverPraiseParams) =>
    ({ get }): PraiseDto[] | undefined => {
      const { periodId, receiverId } = params;
      const userId = get(ActiveUserId);
      const listKey = periodQuantifierPraiseListKey(periodId, userId || '');
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
  ) => Promise<AxiosResponse<PeriodReplaceQuantifierInputDto> | AxiosError>;
};

/**
 * Returns function used to replace quantifiers.
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
      ): Promise<
        AxiosResponse<PeriodReplaceQuantifierInputDto> | AxiosError
      > => {
        const response: AxiosResponse<PeriodReplaceQuantifierInputDto> =
          await apiAuthClient.patch(
            `/admin/periods/${periodId}/replaceQuantifier`,
            {
              currentQuantifierId,
              newQuantifierId,
            }
          );

        if (isResponseOk(response)) {
          const periodReplaceQuantifierDto = response.data;
          set(
            SinglePeriod(periodReplaceQuantifierDto.period._id),
            periodReplaceQuantifierDto.period
          );
          periodReplaceQuantifierDto.praises.forEach((praise) => {
            // TODO: UNCOMMENT!
            //set(SinglePraise(praise._id), praise);
          });
        }

        return response;
      }
  );
  return { replaceQuantifier };
};
