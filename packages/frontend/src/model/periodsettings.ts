import { AxiosError, AxiosResponse } from 'axios';
import { atomFamily, selectorFamily, useRecoilCallback } from 'recoil';
import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfPeriodSetting = (object: any): object is PeriodSettingDto => {
  return '_id' in object;
};

/**
 * Atom that fetches all period settings when initialised.
 */
export const AllPeriodSettings = atomFamily<
  PeriodSettingDto[] | undefined,
  string
>({
  key: 'AllPeriodSettings',
  default: undefined,
  effects: (periodId) => [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: `/periodsettings/${periodId}/settings`,
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const periodSettings = response.data as PeriodSettingDto[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0)
              return periodSettings;
          }
        })
      );
    },
  ],
});

type SinglePeriodSettingParams = {
  periodId: string;
  key: string;
};

/**
 * Selector to get a single period setting.
 */
export const SinglePeriodSetting = selectorFamily({
  key: 'SinglePeriodSetting',
  get:
    (params: SinglePeriodSettingParams) =>
    ({ get }): PeriodSettingDto | undefined => {
      const allPeriodSettings = get(AllPeriodSettings(params.periodId));
      if (!allPeriodSettings) return;
      return allPeriodSettings.find((setting) => setting.key === params.key);
    },
  set:
    (params: SinglePeriodSettingParams) =>
    ({ get, set }, newSetting): void => {
      const oldSetting = get(SinglePeriodSetting(params));
      const allSettings = get(AllPeriodSettings(params.periodId));
      if (!instanceOfPeriodSetting(newSetting) || !oldSetting || !allSettings)
        return;
      set(
        AllPeriodSettings(params.periodId),
        allSettings.map((s) => (s._id === newSetting._id ? newSetting : s))
      );
    },
});

/**
 * Selector to get an individual setting value in its type.
 */
export const SinglePeriodSettingValueRealized = selectorFamily({
  key: 'SinglePeriodSettingValueRealized',
  get:
    (params: SinglePeriodSettingParams) =>
    ({ get }): string | number | number[] | boolean | File | undefined => {
      const setting = get(SinglePeriodSetting(params));
      return setting && setting.valueRealized;
    },
});

export type useSetSettingReturn = {
  setSetting: (
    setting: PeriodSettingDto
  ) => Promise<AxiosResponse<PeriodSettingDto> | AxiosError | undefined>;
};

/**
 * Returns function to set one individual period setting.
 */
export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqData = (setting: PeriodSettingDto): any => {
    if (setting.type === 'Image') {
      const data = new FormData();
      data.append('value', setting.value);
      return data;
    } else {
      return setting;
    }
  };

  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (
        setting: PeriodSettingDto
      ): Promise<AxiosResponse<PeriodSettingDto> | AxiosError | undefined> => {
        if (!instanceOfPeriodSetting(setting)) return;
        const response: AxiosResponse<PeriodSettingDto> =
          await apiAuthClient.patch(
            `/admin/periodsettings/${periodId}/settings/${setting._id}/set`,
            reqData(setting)
          );
        if (isResponseOk(response)) {
          const setting = response.data;
          set(SinglePeriodSetting({ periodId, key: setting.key }), setting);
        }
        return response;
      }
  );

  return { setSetting };
};
