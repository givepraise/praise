import { makeApiAuthClient } from '@/utils/api';
import { AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import {
  atomFamily,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { findIndex, find } from 'lodash';
import { ApiAuthGet, useAuthApiQuery } from './api';
import { Setting, useSetSettingReturn, isImageSetting } from './settings';

export const AllPeriodSettings = atomFamily<Setting[], string>({
  key: 'AllPeriodSettings',
  default: [],
});

export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const [allSettings, setAllSettings] = useRecoilState(
    AllPeriodSettings(periodId)
  );

  const setSetting = useRecoilCallback(() => async (setting: Setting) => {
    const url = `/admin/periodsettings/${periodId}/settings/${setting._id}/set`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqData = (setting: Setting): any => {
      if (isImageSetting(setting)) {
        const data = new FormData();
        data.append('value', setting.value);
        return data;
      } else {
        return setting;
      }
    };

    const apiAuthClient = makeApiAuthClient();
    const response = await apiAuthClient.patch(url, reqData(setting));

    const updatedSetting = response.data as Setting;
    const settingIndex = findIndex(
      allSettings,
      (s) => s._id === updatedSetting._id
    );

    if (settingIndex === -1) {
      setAllSettings([updatedSetting]);
    } else {
      const updatedAllSettings = allSettings.slice();
      updatedAllSettings.splice(settingIndex, 1, updatedSetting);

      setAllSettings(updatedAllSettings);
    }

    toast.success(`Saved setting "${updatedSetting.label}"`);
  });

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

export const useAllPeriodSettingsQuery = (periodId: string): void => {
  const allPeriodSettingsQueryResponse = useAuthApiQuery(
    AllPeriodSettingsQuery(periodId)
  );
  const [allPeriodSettings, setAllPeriodSettings] = useRecoilState(
    AllPeriodSettings(periodId)
  );

  React.useEffect(() => {
    const settings = allPeriodSettingsQueryResponse.data as Setting[];
    if (!Array.isArray(settings) || settings.length === 0) return;
    if (allPeriodSettings.length > 0) return;

    setAllPeriodSettings(settings);
  }, [allPeriodSettingsQueryResponse, allPeriodSettings, setAllPeriodSettings]);
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
