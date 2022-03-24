import { makeApiAuthClient } from '@/utils/api';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { ApiAuthGet, isResponseOk, useAuthApiQuery } from './api';

export interface Setting {
  _id: string;
  key: string;
  type: string;
  label: string;
  description: string;
}

export interface StringSetting extends Setting {
  value: string;
}

export interface FileSetting extends Setting {
  value: File;
}

const isFileSetting = (setting: unknown): setting is FileSetting => {
  const fileSetting = setting as FileSetting;
  if (fileSetting.value?.name) return true;
  return false;
};

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

export const AllSettings = atom<StringSetting[] | undefined>({
  key: 'AllSettings',
  default: undefined,
});

export const useAllSettingsQuery = (): AxiosResponse<unknown> => {
  const allSettingsQueryResponse = useAuthApiQuery(AllSettingsQuery);
  const [allSettings, setAllSettings] = useRecoilState(AllSettings);

  React.useEffect(() => {
    if (
      isResponseOk(allSettingsQueryResponse) &&
      typeof allSettings === 'undefined'
    ) {
      const settings = allSettingsQueryResponse.data as StringSetting[];
      if (Array.isArray(settings) && settings.length > 0)
        setAllSettings(settings);
    }
  }, [allSettingsQueryResponse, setAllSettings, allSettings]);

  return allSettingsQueryResponse;
};

export const SetSettingApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'SetSettingApiResponse',
  default: null,
});

export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }): StringSetting | undefined => {
      const allSettings = get(AllSettings);
      if (!allSettings) return undefined;
      return allSettings.find((setting) => setting.key === key);
    },
});

export const SingleFloatSetting = selectorFamily({
  key: 'SingleFloatSetting',
  get:
    (key: string) =>
    ({ get }): number | undefined => {
      const setting = get(SingleSetting(key));
      if (!setting) return undefined;
      if (setting && setting.value) {
        const float = parseFloat(setting.value);
        if (!isNaN(float)) return float;
      }
      return undefined;
    },
});

export const SingleBooleanSetting = selectorFamily({
  key: 'SingleBooleanSetting',
  get:
    (key: string) =>
    ({ get }): boolean | undefined => {
      const setting = get(SingleSetting(key));
      if (!setting) return undefined;
      if (setting && setting.value) {
        if (setting.value.toLowerCase() === 'true') return true;
        if (setting.value.toLowerCase() === 'false') return false;
      }
      return undefined;
    },
});

export const SingleIntSetting = selectorFamily({
  key: 'SingleIntSetting',
  get:
    (key: string) =>
    ({ get }): number | undefined => {
      const setting = get(SingleSetting(key));
      if (!setting) return undefined;
      if (setting && setting.value) {
        const int = parseInt(setting.value);
        if (!isNaN(int)) return int;
      }
      return undefined;
    },
});

export const SingleStringSetting = selectorFamily({
  key: 'SingleStringSetting',
  get:
    (key: string) =>
    ({ get }): string | undefined => {
      const setting = get(SingleSetting(key));
      if (!setting) return undefined;
      if (setting && setting.value) {
        const string = setting.value.toString();
        if (string && string !== '') return string;
      }
      return undefined;
    },
});

export const ImageSettingFullPath = selectorFamily({
  key: 'ImageSettingFullPath',
  get:
    (key: string) =>
    ({ get }): string | undefined => {
      const setting = get(SingleSetting(key));
      if (!setting) return undefined;
      if (setting && setting.value) {
        const string = setting.value.toString();
        if (string && string !== '')
          return `${process.env.REACT_APP_BACKEND_URL}/${string}`;
      }
      return undefined;
    },
});

type useSetSettingReturn = {
  setSetting: (
    setting: StringSetting | FileSetting
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};
export const useSetSetting = (): useSetSettingReturn => {
  const allSettings: StringSetting[] | undefined = useRecoilValue(AllSettings);
  const setSetting = useRecoilCallback(
    ({ snapshot, set }) =>
      async (setting: StringSetting | FileSetting) => {
        const url = `/admin/settings/${setting._id}/set`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reqData = (setting: StringSetting | FileSetting): any => {
          if (isFileSetting(setting)) {
            const data = new FormData();
            data.append('value', setting.value);
            return data;
          } else {
            return setting;
          }
        };

        const apiAuthClient = makeApiAuthClient();
        const response = await apiAuthClient.patch(url, reqData(setting));

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const setting = response.data as StringSetting;
          toast.success(`Saved ${setting.key}`);
          if (setting) {
            if (typeof allSettings !== 'undefined') {
              set(
                AllSettings,
                allSettings.map(
                  (oldSetting) =>
                    oldSetting._id === setting._id ? setting : oldSetting,
                  setting
                )
              );
            } else {
              set(AllSettings, [setting]);
            }
          }
          set(SetSettingApiResponse, response);
        }
        return response;
      }
  );
  return { setSetting };
};
