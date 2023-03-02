import { AxiosError, AxiosResponse } from 'axios';
import { atom, selectorFamily, useRecoilCallback } from 'recoil';
import { isEmpty } from 'lodash';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from '../api';
import { Setting } from './dto/setting.dto';
import { SetSettingDto } from './dto/set-setting.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfSetting = (object: any): object is Setting => {
  return '_id' in object;
};

/**
 * Atom that fetches all global settings when initialised.
 */
export const AllSettings = atom<Setting[] | undefined>({
  key: 'AllSettings',
  default: undefined,
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: '/settings',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const periodSettings = response.data as Setting[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0)
              return periodSettings;
          }
        })
      );
    },
  ],
});

/**
 * Selector to get a single setting.
 */
export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }): Setting | undefined => {
      const allSettings = get(AllSettings);
      if (!allSettings) return;
      return allSettings.find((setting) => setting.key === key);
    },
  set:
    (key: string) =>
    ({ get, set }, newSetting): void => {
      const oldSetting = get(SingleSetting(key));
      const allSettings = get(AllSettings);
      if (!instanceOfSetting(newSetting) || !oldSetting || !allSettings) return;
      set(
        AllSettings,
        allSettings.map((s) => (s._id === newSetting._id ? newSetting : s))
      );
    },
});

type useSetSettingReturn = {
  setSetting: (
    setting: Setting
  ) => Promise<AxiosResponse<Setting> | AxiosError | undefined>;
};

/**
 * Returns function to set one individual setting.
 */
export const useSetSetting = (): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();

  const reqData = (setting: Setting): SetSettingDto | FormData => {
    if (setting.type === 'Image') {
      if (
        setting.value &&
        !isEmpty(setting.value) &&
        setting.value.length > 0
      ) {
        const formData = new FormData();
        formData.append('value', setting.value[0]);
        return formData;
      }
      throw new Error('No file chosen.');
    } else {
      return { value: setting.value || '' };
    }
  };

  const setSetting = useRecoilCallback(
    ({ set }) =>
      async (
        setting: Setting
      ): Promise<AxiosResponse<Setting> | AxiosError | undefined> => {
        if (!instanceOfSetting(setting)) return;

        // If the setting is an image, we need to use a different endpoint.
        const upload = setting.type === 'Image' ? '/upload' : '';

        const response: AxiosResponse<Setting> = await apiAuthClient.patch(
          `/settings/${setting._id}${upload}`,
          reqData(setting)
        );
        if (isResponseOk(response)) {
          const setting = response.data;
          set(SingleSetting(setting.key), setting);
        }
        return response;
      }
  );

  return { setSetting };
};
