import {
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilValue,
} from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { ApiKey } from './dto/apikeys.dto';
import { CreateApiKeyResponseDto } from './dto/create-api-key-input.dto';
import { useApiAuthClient } from '@/utils/api';

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

// type useSetApiKeyReturn = {
//   setApiKey: (
//     createdApiKey: CreateApiKeyResponseDto
//   ) => Promise<AxiosResponse<CreateApiKeyResponseDto> | AxiosError | undefined>;
// };

type useSetApiKeyReturn = {
  setApiKey: (
    createdApiKey: CreateApiKeyResponseDto
  ) => Promise<AxiosResponse<CreateApiKeyResponseDto> | AxiosError | undefined>;
};

/**
 * Returns function used to create a api key.
 */
export const useSetApiKey = (): useSetApiKeyReturn => {
  const apiAuthClient = useApiAuthClient();

  const setApiKey = useRecoilCallback(
    ({ set }) =>
      async (
        data
      ): Promise<AxiosResponse<CreateApiKeyResponseDto> | AxiosError> => {
        const response = await apiAuthClient.post('/api-key', data);
        if (isResponseOk(response)) {
          const createdApiKey = response.data as CreateApiKeyResponseDto;
          return createdApiKey;
        }
        return response as AxiosResponse | AxiosError;
      }
  );
  return { setApiKey };
};
