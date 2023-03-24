import { selector, useRecoilCallback } from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isResponseOk } from '../api';
import { ApiKey } from './dto/apikeys.dto';
import {
  CreateApiKeyInputDto,
  CreateApiKeyResponseDto,
} from './dto/create-api-key-input.dto';
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

type useSetApiKeyReturn = {
  setApiKey: (
    data: CreateApiKeyInputDto
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
      ): Promise<
        AxiosResponse<CreateApiKeyResponseDto> | AxiosError | undefined
      > => {
        const response = await apiAuthClient.post('/api-key', data);
        if (isResponseOk(response)) {
          // const createdApiKey = response.data as CreateApiKeyResponseDto;
          const createdApiKey =
            response.data as AxiosResponse<CreateApiKeyResponseDto>;
          return createdApiKey;
        }
        return response as AxiosResponse | AxiosError;
      }
  );
  return { setApiKey };
};

// export const useCreatePeriod = (): useCreatePeriodReturn => {
//   const apiAuthClient = useApiAuthClient();

//   const createPeriod = useRecoilCallback(
//     ({ set }) =>
//       async (
//         periodInput: CreatePeriodInputDto
//       ): Promise<AxiosResponse<Praise> | AxiosError> => {
//         const response = await apiAuthClient.post('/periods', periodInput);
//         if (isResponseOk(response)) {
//           const period = response.data as PeriodDetailsDto;
//           set(SinglePeriod(period._id), period);
//         }
//         return response as AxiosResponse | AxiosError;
//       }
//   );

//   return { createPeriod };
// };
