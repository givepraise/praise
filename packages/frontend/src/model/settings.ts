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
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';

export interface Setting {
  _id: string;
  key: string;
  value: string;
  type: string;
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

export const AllSettings = atom<Setting[] | undefined>({
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
      const settings = allSettingsQueryResponse.data as Setting[];
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
    ({ get }): Setting | undefined => {
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

type useSetSettingReturn = {
  setSetting: (
    setting: Setting
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};
export const useSetSetting = (): useSetSettingReturn => {
  const allSettings: Setting[] | undefined = useRecoilValue(AllSettings);
  const setSetting = useRecoilCallback(
    ({ snapshot, set }) =>
      async (setting: Setting) => {
        let params = {
          url: `/admin/settings/${setting._id}/set`,
          data: { value: setting.value },
        };

        if (setting.type === 'Image') {
          params = {
            ...params,
            ...{
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              file: setting.type === 'Image' ? setting.value : null,
            },
          };
        }

        const response = await ApiQuery(
          snapshot.getPromise(ApiAuthPatch(params))
        );

        // If OK response, add returned period object to local state
        if (isResponseOk(response)) {
          const setting = response.data as Setting;
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
