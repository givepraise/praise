import { selector, useRecoilValue } from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { ApiKey } from './dto/apikeys.dto';

// import { Components } from '../api/api.types';

// export type CreateApiKeyInputDto = components['schemas']['CreateApiKeyInputDto'];
// export type CreateApiKeyResponseDto = components['schemas']['CreateApiKeyResponseDto'];

import { components } from 'api-types';

export type User = components['schemas']['User'];

/**
 * Query to get the list of api keys
 */
export const ApiKeysListQuery = selector<ApiKey[]>({
  key: 'ApiKeysListQuery',
  get: ({ get }) => {
    const response = get(ApiAuthGet({ url: '/api-key' })) as AxiosResponse<
      ApiKey[]
    >;
    return response.data;
  },
});
