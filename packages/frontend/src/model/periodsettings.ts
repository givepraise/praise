import { AxiosError, AxiosResponse } from 'axios';
import {
  atomFamily,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';

export const AllPeriodSettings = atomFamily<
  PeriodSettingDto[] | undefined,
  string
>({
  key: 'AllPeriodSettings',
  default: undefined,
  effects: (periodId) => [
    ({ setSelf, trigger, getPromise }): void => {
      if (trigger === 'get' && periodId !== undefined) {
        const apiGet = async (): Promise<void> => {
          const response = await getPromise(
            ApiAuthGet({
              url: `/periodsettings/${periodId}/settings/all`,
            })
          );
          if (isResponseOk(response)) {
            const periodSettings = response.data as PeriodSettingDto[];
            if (Array.isArray(periodSettings) && periodSettings.length > 0)
              setSelf(periodSettings);
          }
        };
        void apiGet();
      }
    },
  ],
});

type SinglePeriodSettingParams = {
  periodId: string;
  key: string;
};

export const SinglePeriodSetting = selectorFamily({
  key: 'SingleSetting',
  get:
    (params: SinglePeriodSettingParams) =>
    ({ get }): PeriodSettingDto | undefined => {
      const allPeriodSettings = get(AllPeriodSettings(params.periodId));
      if (!allPeriodSettings) return;
      return allPeriodSettings.filter(
        (setting) => setting.key === params.key
      )[0];
    },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reqData = (setting: PeriodSettingDto): any => {
  if (setting.type === 'Image') {
    const data = new FormData();
    data.append('value', setting.value);
    return data;
  } else {
    return setting;
  }
};

export type useSetSettingReturn = {
  setSetting: (
    setting: PeriodSettingDto
  ) => Promise<AxiosResponse<PeriodSettingDto> | AxiosError<PeriodSettingDto>>;
};

export const useSetPeriodSetting = (periodId: string): useSetSettingReturn => {
  const apiAuthClient = useApiAuthClient();
  const [allPeriodSettings, setAllPeriodSettings] = useRecoilState(
    AllPeriodSettings(periodId)
  );

  const setSetting = async (
    setting: PeriodSettingDto
  ): Promise<
    AxiosResponse<PeriodSettingDto> | AxiosError<PeriodSettingDto>
  > => {
    const response = await apiAuthClient.patch(
      `/admin/periodsettings/${periodId}/settings/${setting._id}/set`,
      reqData(setting)
    );
    if (isResponseOk(response)) {
      const setting = response.data as PeriodSettingDto;
      if (setting && typeof allPeriodSettings !== 'undefined') {
        setAllPeriodSettings(
          allPeriodSettings.map((oldSetting) =>
            oldSetting._id === setting._id ? setting : oldSetting
          )
        );
      }
    }
    return response;
  };

  return { setSetting };
};

export const usePeriodSettingValueRealized = (
  periodId: string,
  key: string
): string | number | number[] | boolean | File | undefined => {
  const setting = useRecoilValue(SinglePeriodSetting({ periodId, key }));
  if (!setting) return undefined;

  return setting.valueRealized;
};
