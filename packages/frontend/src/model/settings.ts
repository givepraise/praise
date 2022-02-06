import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import toast from 'react-hot-toast';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import {
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  ApiQuery,
  isApiResponseOk,
  useAuthApiQuery,
} from './api';

export interface Setting {
  _id: string;
  key: string;
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
      ApiAuthGetQuery({
        endPoint: '/api/settings/all',
      })
    );
  },
});

export const AllSettings = atom<Setting[] | undefined>({
  key: 'AllSettings',
  default: undefined,
});

export const useAllSettingsQuery = () => {
  const allSettingsQueryResponse = useAuthApiQuery(AllSettingsQuery);
  const [allSettings, setAllSettings] = useRecoilState(AllSettings);

  React.useEffect(() => {
    if (
      isApiResponseOk(allSettingsQueryResponse) &&
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
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: 'SetSettingApiResponse',
  default: null,
});

export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }) => {
      const allSettings = get(AllSettings);
      if (!allSettings) return null;
      return allSettings.find((setting) => setting.key === key);
    },
});

export const SingleFloatSetting = selectorFamily({
  key: 'SingleFloatSetting',
  get:
    (key: string) =>
    ({ get }) => {
      const setting = get(SingleSetting(key));
      if (!setting) return null;
      if (setting && setting.value) {
        const float = parseFloat(setting.value);
        if (!isNaN(float)) return float;
      }
      return null;
    },
});

export const SingleBooleanSetting = selectorFamily({
  key: 'SingleBooleanSetting',
  get:
    (key: string) =>
    ({ get }) => {
      const setting = get(SingleSetting(key));
      if (!setting) return null;
      if (setting && setting.value) {
        if (setting.value.toLowerCase() === 'true') return true;
        if (setting.value.toLowerCase() === 'false') return false;
      }
      return null;
    },
});

export const SingleIntSetting = selectorFamily({
  key: 'SingleIntSetting',
  get:
    (key: string) =>
    ({ get }) => {
      const setting = get(SingleSetting(key));
      if (!setting) return null;
      if (setting && setting.value) {
        const int = parseInt(setting.value);
        if (!isNaN(int)) return int;
      }
      return null;
    },
});

export const useSetSetting = () => {
  const allSettings: Setting[] | undefined = useRecoilValue(AllSettings);
  const setSetting = useRecoilCallback(
    ({ snapshot, set }) =>
      async (setting: Setting) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatchQuery({
              endPoint: `/api/admin/settings/${setting._id}/set`,
              data: JSON.stringify({ value: setting.value }),
            })
          )
        );

        // If OK response, add returned period object to local state
        if (isApiResponseOk(response)) {
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
        }
        set(SetSettingApiResponse, response);
        return response;
      }
  );
  return { setSetting };
};
