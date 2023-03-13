import { selector, useRecoilValue } from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isApiResponseAxiosError, isResponseOk } from '../api';
import { ApiKey } from './dto/apikeys.dto';
import { CreateApiKeyResponseDto } from './dto/create-api-key-input.dto';

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

/**
 * Returns function used to create a api key.
 */
export const useApiKeyPeriod = (): CreateApiKeyResponseDto => {
  const createdApiKey = {
    name: '89f7edbd',
    description: 'My API Key',
    hash: '$2b$10$hfRNI.V7ewuN/K.5eSt6oelaQ.FDj6irfUNR9wkKnL/qsNT23aE4i',
    role: 'API_KEY_READWRITE',
    createdAt: '2023-03-13T17:24:40.220Z',
    updatedAt: '2023-03-13T17:24:40.220Z',
    key: '1834a97caed67b244dd11fa5ef53aa74f13781ad0aea8148b8607d861d9f7535',
  };
  // const apiAuthClient = useApiAuthClient();
  // const createPeriod = useRecoilCallback(
  //   ({ set }) =>
  //     async (
  //       periodInput: CreatePeriodInputDto
  //     ): Promise<AxiosResponse<Praise> | AxiosError> => {
  //       const response = await apiAuthClient.post('/periods', periodInput);
  //       if (isResponseOk(response)) {
  //         const period = response.data as PeriodDetailsDto;
  //         set(SinglePeriod(period._id), period);
  //       }
  //       return response as AxiosResponse | AxiosError;
  //     }
  // );
  return createdApiKey;
};
