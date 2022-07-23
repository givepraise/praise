import { ApiErrorResponseData } from 'api/dist/error/types';
import { AxiosError, AxiosResponse } from 'axios';
import { selectorFamily, SerializableParam } from 'recoil';
import { AccessToken } from './auth';
import { makeApiAuthClient } from '../utils/api';

type RequestParams = {
  [key: string]: SerializableParam;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file?: any;
};

type RequestDataParam = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file?: any;
};

type PatchRequestParams = RequestParams & RequestDataParam;
type PostRequestParams = RequestParams & RequestDataParam;

export const isResponseOk = <T>(
  response: AxiosResponse<T> | AxiosError<T> | null | unknown
): response is AxiosResponse<T> => {
  const axiosResponse = response as AxiosResponse;
  if (!axiosResponse) return false;
  return axiosResponse.status === 200;
};

export const isApiResponseAxiosError = (
  axiosResponse: AxiosResponse | AxiosError | null | unknown
): axiosResponse is AxiosError<ApiErrorResponseData> => {
  return (
    axiosResponse !== null &&
    (axiosResponse as AxiosError).isAxiosError !== undefined
  );
};

export const isApiResponseValidationError = (
  axiosResponse: unknown
): axiosResponse is AxiosError<ApiErrorResponseData> => {
  if (
    isApiResponseAxiosError(axiosResponse) &&
    axiosResponse.response?.status === 400 &&
    axiosResponse.response.data.errors
  )
    return true;
  return false;
};

/**
 * Authenticated GET request
 */
export const ApiAuthGet = selectorFamily<AxiosResponse<unknown>, RequestParams>(
  {
    key: 'ApiAuthGet',
    get:
      (params: RequestParams) =>
      async ({ get }): Promise<AxiosResponse<never>> => {
        const { config, url } = params;
        const accessToken = get(AccessToken);
        if (!accessToken) throw new Error('AccessToken not available.');
        const apiAuthClient = makeApiAuthClient(accessToken);
        const response = await apiAuthClient.get(url, config);
        return response;
      },
  }
);

/**
 * Authenticated POST request
 */
export const ApiAuthPost = selectorFamily<
  AxiosResponse<unknown>,
  PostRequestParams
>({
  key: 'ApiAuthPost',
  get:
    (params: PostRequestParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const { config, url, data } = params;
      const accessToken = get(AccessToken);
      if (!accessToken) throw new Error('AccessToken not available.');
      const apiAuthClient = makeApiAuthClient(accessToken);
      const response = await apiAuthClient.post(url, data, config);

      return response;
    },
});

/**
 * An authenticated PATCH request
 */
export const ApiAuthPatch = selectorFamily<
  AxiosResponse<unknown>,
  PatchRequestParams
>({
  key: 'ApiAuthPatch',
  get:
    (params: PatchRequestParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const { config, url, data, file } = params;

      const formData = new FormData();
      formData.append('value', file);

      const reqData = file ? formData : data;

      const accessToken = get(AccessToken);
      if (!accessToken) throw new Error('AccessToken not available.');
      const apiAuthClient = makeApiAuthClient(accessToken);
      const response = await apiAuthClient.patch(url, reqData, config);

      return response;
    },
});
