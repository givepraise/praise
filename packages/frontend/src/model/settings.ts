import { AxiosError, AxiosResponse } from 'axios';
import { atom, selectorFamily, useRecoilState } from 'recoil';
import { SettingDto } from 'api/dist/settings/types';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';

export const AllSettings = atom<SettingDto[] | undefined>({
  key: 'AllSettings',
  default: undefined,
  effects: [
    ({ setSelf, trigger, getPromise }): void => {
      if (trigger === 'get') {
        const apiGet = async (): Promise<void> => {
          const response = await getPromise(
            ApiAuthGet({
              url: '/settings/all',
            })
          );
          if (isResponseOk(response)) {
            const periodSettings = response.data as SettingDto[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0)
              setSelf(periodSettings);
          }
        };
        void apiGet();
      }
    },
  ],
});

export const SingleSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (key: string) =>
    ({ get }): SettingDto | undefined => {
      const allSettings = get(AllSettings);
      if (!allSettings) return;
      return allSettings.filter((setting) => setting.key === key)[0];
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reqData = (setting: SettingDto): any => {
  if (setting.type === 'Image') {
    const data = new FormData();
    data.append('value', setting.value);
    return data;
  } else {
    return setting;
  }
};

type useSetSettingReturn = {
  setSetting: (
    setting: SettingDto
  ) => Promise<AxiosResponse<SettingDto> | AxiosError<SettingDto>>;
};

export const useSetSetting = (): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();
  const [allSettings, setAllSettings] = useRecoilState(AllSettings);

  const setSetting = async (
    setting: SettingDto
  ): Promise<AxiosResponse<SettingDto> | AxiosError<SettingDto>> => {
    const response = await apiAuthClient.patch(
      `/admin/settings/${setting._id}/set`,
      reqData(setting)
    );
    if (isResponseOk(response)) {
      const setting = response.data as SettingDto;
      if (setting && typeof allSettings !== 'undefined') {
        setAllSettings(
          allSettings.map((oldSetting) =>
            oldSetting._id === setting._id ? setting : oldSetting
          )
        );
      }
    }
    return response;
  };

  return { setSetting };
};
