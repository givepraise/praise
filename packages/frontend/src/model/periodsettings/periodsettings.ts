import { AxiosError, AxiosResponse } from 'axios';
import { atomFamily, selectorFamily, useRecoilCallback } from 'recoil';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from '../api';
import { PeriodSettingDto } from './dto/period-settings.dto';
import { SettingDto } from '../settings/dto/setting.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfSetting = (object: any): object is SettingDto => {
  return '_id' in object;
};

export const periodSettingToSetting = (
  periodSetting: PeriodSettingDto
): SettingDto => {
  return {
    ...periodSetting.setting,
    value: periodSetting.value,
  };
};

/**
 * Atom that fetches all period settings when initialised.
 */
export const AllPeriodSettings = atomFamily<SettingDto[] | undefined, string>({
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
            const periodSettings = response.data as PeriodSettingDto[];
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
    ({ get }): SettingDto | undefined => {
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
    ({ get }): string | number | number[] | boolean | File | undefined => {
      const setting = get(SinglePeriodSetting(params));
      // TODO: Handle typing of setting value
      return setting && setting.value;
    },
});

export type useSetSettingReturn = {
  setSetting: (
    setting: SettingDto
  ) => Promise<AxiosResponse<PeriodSettingDto> | AxiosError | undefined>;
};

/**
 * Returns function to set one individual period setting.
 */
export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqData = (setting: SettingDto): any => {
    if (setting.type === 'Image') {
      if (!setting.value) {
        throw new Error('Image setting value is undefined');
      }
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
        setting: SettingDto
      ): Promise<AxiosResponse<PeriodSettingDto> | AxiosError | undefined> => {
        if (!instanceOfSetting(setting)) return;
        const response: AxiosResponse<PeriodSettingDto> =
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
