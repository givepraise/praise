import { selector, useRecoilValue } from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { ApiKeyDto } from './apikeys.dto';

export const ApiKeysListQuery = selector<ApiKeyDto[]>({
  key: 'ApiKeysListQuery',
  get: ({ get }) => {
    const response = get(ApiAuthGet({ url: '/api-key' })) as AxiosResponse<
      ApiKeyDto[]
    >;
    return response.data;
  },
});
