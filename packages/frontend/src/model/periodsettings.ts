import { makeApiAuthClient } from '@/utils/api';
import { AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import {
  atomFamily,
  selectorFamily,
  useRecoilCallback,
  useRecoilValue,
} from 'recoil';
import { find } from 'lodash';
import { ApiAuthGet, useAuthApiQuery, isResponseOk } from './api';
import { Setting, useSetSettingReturn } from './settings';
import { PeriodSettingDto } from 'shared/dist/periodsettings/types';

export const AllPeriodSettingIds = atomFamily<string[] | undefined, string>({
  key: 'PeriodSettingIdList',
  default: undefined,
});

export const SinglePeriodSetting = atomFamily<
  PeriodSettingDto | undefined,
  string
>({
  key: 'SinglePeriodSetting',
  default: undefined,
});

export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (setting: Setting) => {
        const url = `/admin/periodsettings/${periodId}/settings/${setting._id}/set`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reqData = (setting: Setting): any => {
          if (setting.type === 'Image') {
            const data = new FormData();
            data.append('value', setting.value);
            return data;
          } else {
            return setting;
          }
        };

        const apiAuthClient = makeApiAuthClient();
        const response = await apiAuthClient.patch(url, reqData(setting));

        if (response.data) {
          set(SinglePeriodSetting(setting._id), response.data);

          toast.success(`Saved setting "${response.data.label}"`);
        }
      }
  );

  return { setSetting };
};

export const AllPeriodSettingsQuery = selectorFamily({
  key: 'AllPeriodSettingsQuery',
  get:
    (periodId: string) =>
      ({ get }): AxiosResponse<unknown> => {
        return get(
          ApiAuthGet({
            url: `/periodsettings/${periodId}/settings/all`,
          })
        );
      },
});

export const AllPeriodSettings = selectorFamily({
  key: 'AllPeriodSettings',
  get:
    (periodId: string) =>
      ({ get }): PeriodSettingDto[] | undefined => {
        const allPeriodSettingIds = get(AllPeriodSettingIds(periodId));
        if (!allPeriodSettingIds) return undefined;

        const allPeriodSettings: PeriodSettingDto[] = [];
        for (const settingId of allPeriodSettingIds) {
          const setting = get(SinglePeriodSetting(settingId));
          if (setting) {
            allPeriodSettings.push(setting);
          }
        }
        return allPeriodSettings;
      },
});

export const useAllPeriodSettingsQuery = (
  periodId: string
): AxiosResponse<unknown> => {
  const allPeriodSettingsQueryResponse = useAuthApiQuery(
    AllPeriodSettingsQuery(periodId)
  );
  const allPeriodSettingsIds = useRecoilValue(AllPeriodSettingIds(periodId));

  const saveAllPeriodSettings = useRecoilCallback(
    ({ set, snapshot }) =>
      (settings: PeriodSettingDto[]) => {
        const settingIds: string[] = [];
        for (const setting of settings) {
          settingIds.push(setting._id);
          const oldsetting = snapshot.getLoadable(
            SinglePeriodSetting(setting._id)
          ).contents;
          if (oldsetting) {
            set(SinglePeriodSetting(setting._id), {
              ...oldsetting,
              ...setting,
            });
          } else {
            set(SinglePeriodSetting(setting._id), setting);
          }
        }
        set(AllPeriodSettingIds(periodId), settingIds);
      }
  );

  // Only set AllSettings if not previously loaded
  React.useEffect(() => {
    if (
      isResponseOk(allPeriodSettingsQueryResponse) &&
      typeof allPeriodSettingsIds === 'undefined'
    ) {
      const settings = allPeriodSettingsQueryResponse.data;

      if (Array.isArray(settings)) {
        void saveAllPeriodSettings(settings);
      }
    }
  }, [
    allPeriodSettingsQueryResponse,
    allPeriodSettingsIds,
    saveAllPeriodSettings,
  ]);

  return allPeriodSettingsQueryResponse;
};

export const usePeriodSettingValueRealized = (
  periodId: string,
  key: string
): string | number | number[] | boolean | File | undefined => {
  const settings = useRecoilValue(AllPeriodSettings(periodId));
  const setting = find(settings, { key });
  if (!setting) return undefined;

  return setting.valueRealized;
};
