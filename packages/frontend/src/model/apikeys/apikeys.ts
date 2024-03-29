import {
  atom,
  selectorFamily,
  useRecoilCallback,
  useRecoilValue,
} from 'recoil';
import { AxiosResponse, AxiosError } from 'axios';
import { ApiAuthGet, isResponseOk } from '../api';
import { ApiKey } from './dto/apikeys.dto';
import {
  CreateApiKeyInputDto,
  CreateApiKeyResponseDto,
} from './dto/create-api-key-input.dto';
import { useApiAuthClient } from '@/utils/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfApiKey = (object: any): object is ApiKey => {
  return '_id' in object;
};

/**
 * Query to get the list of api keys
 */
export const AllApiKeys = atom<ApiKey[]>({
  key: 'AllApiKeys',
  default: [],
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: '/api-key',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const apiKeys = response.data as ApiKey[];
            if (Array.isArray(apiKeys)) {
              return apiKeys;
            }
          }
          return [];
        })
      );
    },
  ],
});

/**
 * Selector that returns one individual Api Key.
 */
export const SingleApiKey = selectorFamily({
  key: 'SingleApiKey',
  get:
    (apikeyId: string | undefined) =>
    ({ get }): ApiKey | undefined => {
      const allApiKeys = get(AllApiKeys);
      if (!allApiKeys || !apikeyId) return undefined;
      return allApiKeys.filter((apikey) => apikey._id === apikeyId)[0];
    },
  set:
    (apikeyId: string | undefined) =>
    ({ get, set }, apikey): void => {
      const allApiKeys = get(AllApiKeys);
      if (!apikeyId || !apikey || !instanceOfApiKey(apikey) || !allApiKeys)
        return;
      // Add new Api key to the list of all Api keys
      set(AllApiKeys, [...allApiKeys, apikey]);
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
          const createdApiKey = response.data as CreateApiKeyResponseDto;
          set(SingleApiKey(createdApiKey._id), createdApiKey);
        }
        return response as AxiosResponse | AxiosError;
      }
  );

  return { setApiKey };
};

type useDeleteApiKeyReturn = {
  deleteApiKey: (
    id: string
  ) => Promise<AxiosResponse<ApiKey> | AxiosError | undefined>;
};

/**
 * Returns function used to delete a api key.
 */
export const useDeleteApiKey = (): useDeleteApiKeyReturn => {
  const allApiKeys = useRecoilValue(AllApiKeys);
  const apiAuthClient = useApiAuthClient();

  const deleteApiKey = useRecoilCallback(
    ({ set }) =>
      async (
        id: string
      ): Promise<AxiosResponse<ApiKey> | AxiosError | undefined> => {
        const response = await apiAuthClient.delete('/api-key/' + id);

        if (isResponseOk(response)) {
          const updatedApiKeys = allApiKeys.filter(
            (apiKey) => apiKey._id !== id
          );
          set(AllApiKeys, updatedApiKeys);
        }

        return response as AxiosResponse | AxiosError;
      }
  );

  return { deleteApiKey };
};
