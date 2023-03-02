import { AxiosError, AxiosResponse } from 'axios';
import { atomFamily, selectorFamily, useRecoilCallback } from 'recoil';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from '../api';
import { PeriodSetting } from './dto/period-settings.dto';
import { Setting } from '../settings/dto/setting.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfSetting = (object: any): object is Setting => {
  return '_id' in object;
};

export const periodSettingToSetting = (
  periodSetting: PeriodSetting,
  index = 0
): Setting => {
  return {
    ...periodSetting[index].setting,
    value: periodSetting.value,
    valueRealized: periodSetting.valueRealized,
  };
};

/**
 * Atom that fetches all period settings when initialised.
 */
export const AllPeriodSettings = atomFamily<Setting[] | undefined, string>({
  key: 'AllPeriodSettings',
  default: undefined,
  effects: (periodId) => [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: `/periods/${periodId}/settings`,
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const periodSettings = response.data as PeriodSetting[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0) {
              return periodSettings.map((setting) =>
                periodSettingToSetting(setting)
              );
            }
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
    ({ get }): Setting | undefined => {
      const allPeriodSettings = get(AllPeriodSettings(params.periodId));
      if (!allPeriodSettings) return;
      return allPeriodSettings.find((setting) => setting.key === params.key);
    },
  set:
    (params: SinglePeriodSettingParams) =>
    ({ get, set }, newSetting): void => {
      const oldSetting = get(SinglePeriodSetting(params));
      const allSettings = get(AllPeriodSettings(params.periodId));
      if (!instanceOfSetting(newSetting) || !oldSetting || !allSettings) return;
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
    ({ get }): string | string[] | boolean | number | number[] | undefined => {
      const setting = get(SinglePeriodSetting(params));
      if (!setting?.valueRealized) return undefined;
      return setting.valueRealized;
    },
});

export type useSetSettingReturn = {
  setSetting: (
    setting: Setting
  ) => Promise<AxiosResponse<PeriodSetting> | AxiosError | undefined>;
};

/**
 * Returns function to set one individual period setting.
 */
export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqData = (setting: Setting): any => {
    if (setting.type === 'Image') {
      if (!setting.value) {
        throw new Error('Image setting value is undefined');
      }
      const data = new FormData();
      data.append('value', setting.value);
      return data;
    } else {
      return { value: setting.value || '' };
    }
  };

  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (
        setting: Setting
      ): Promise<AxiosResponse<PeriodSetting> | AxiosError | undefined> => {
        if (!instanceOfSetting(setting)) return;
        const response: AxiosResponse<PeriodSetting> =
          await apiAuthClient.patch(
            `/periods/${periodId}/settings/${setting._id}`,
            reqData(setting)
          );
        if (isResponseOk(response)) {
          const periodSetting = response.data;
          const setting = periodSettingToSetting(periodSetting);
          set(SinglePeriodSetting({ periodId, key: setting.key }), setting);
        }
        return response;
      }
  );

  return { setSetting };
};
