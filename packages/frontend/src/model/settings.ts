import { makeApiAuthClient } from '@/utils/api';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import {
  atom,
  atomFamily,
  selector,
  useRecoilCallback,
  useRecoilValue,
} from 'recoil';
import { ApiAuthGet, useAuthApiQuery, isResponseOk } from './api';
import { SettingDto } from 'shared/dist/settings/types';

export interface Setting {
  _id: string;
  key: string;
  type: string;
  label: string;
  description: string;
  value: string;
  valueRealized: string | boolean | number | number[] | File;
}

export interface StringSetting extends Setting {
  value: string;
}

const AllSettingsRequestId = atom({
  key: 'AllSettingsRequestId',
  default: 0,
});

export const AllSettingsQuery = selector({
  key: 'AllSettingsQuery',
  get: ({ get }) => {
    get(AllSettingsRequestId);
    return get(
      ApiAuthGet({
        url: '/settings/all',
      })
    );
  },
});

export const SingleSetting = atomFamily<SettingDto | undefined, string>({
  key: 'SingleSetting',
  default: undefined,
});

export const AllSettingKeys = atom<string[] | undefined>({
  key: 'SettingIdList',
  default: undefined,
});

export const AllSettings = selector({
  key: 'AllSettings',
  get: ({ get }): SettingDto[] | undefined => {
    const allSettingKeys = get(AllSettingKeys);
    if (!allSettingKeys) return undefined;

    const allSettings: SettingDto[] = [];
    for (const settingId of allSettingKeys) {
      const setting = get(SingleSetting(settingId));
      if (setting) {
        allSettings.push(setting);
      }
    }
    return allSettings;
  },
});

export const useAllSettingsQuery = (): AxiosResponse<unknown> => {
  const allSettingsQueryResponse = useAuthApiQuery(AllSettingsQuery);
  const allSettingsIds = useRecoilValue(AllSettingKeys);

  const saveAllSettings = useRecoilCallback(
    ({ set, snapshot }) =>
      (settings: SettingDto[]) => {
        const settingKeys: string[] = [];
        for (const setting of settings) {
          settingKeys.push(setting.key);
          const oldsetting = snapshot.getLoadable(
            SingleSetting(setting.key)
          ).contents;
          if (oldsetting) {
            set(SingleSetting(setting.key), { ...oldsetting, ...setting });
          } else {
            set(SingleSetting(setting.key), setting);
          }
        }
        set(AllSettingKeys, settingKeys);
      }
  );

  // Only set AllSettings if not previously loaded
  React.useEffect(() => {
    if (
      isResponseOk(allSettingsQueryResponse) &&
      typeof allSettingsIds === 'undefined'
    ) {
      const settings = allSettingsQueryResponse.data;

      if (Array.isArray(settings)) {
        void saveAllSettings(settings);
      }
    }
  }, [allSettingsQueryResponse, allSettingsIds, saveAllSettings]);

  return allSettingsQueryResponse;
};

export const SetSettingApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'SetSettingApiResponse',
  default: null,
});

export type useSetSettingReturn = {
  setSetting: (setting: Setting) => Promise<void>;
};

export const useSetSetting = (): useSetSettingReturn => {
  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (setting: Setting) => {
        const url = `/admin/settings/${setting._id}/set`;

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
          set(SingleSetting(setting.key), response.data);

          toast.success(`Saved setting "${response.data.label}"`);
        }
      }
  );

  return { setSetting };
};
