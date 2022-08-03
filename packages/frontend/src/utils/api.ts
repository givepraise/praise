import axios, { AxiosError, AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { useRecoilValue } from 'recoil';

import { AccessToken } from '@/model/auth';

import { requestApiAuthRefresh } from './auth';
import { handleErrors } from './axios';

/**
 * Attempt to refresh auth token and retry request
 */
const refreshAuthTokenSet = async (err: AxiosError): Promise<void> => {
  if (!err?.response?.config?.headers)
    throw Error('Error response has no headers');
  const tokenSet = await requestApiAuthRefresh();
  if (!tokenSet) return;

  err.response.config.headers[
    'Authorization'
  ] = `Bearer ${tokenSet.accessToken}`;
};

/**
 * We assume the API to be running on the same domain in production currently.
 * Why? The frontend is built as a static website and cannot easily accept
 * env variables. There are workarounds but we haven't prioritised to implement them yet.
 *
 * One example: https://jakobzanker.de/blog/inject-environment-variables-into-a-react-app-docker-on-runtime/
 */
const apiBaseURL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : `${process.env.REACT_APP_SERVER_URL as string}/api`;

/**
 * Api client for unathenticated requests
 *
 * @returns
 */
export const makeApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: apiBaseURL,
  });
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err);
    }
  );
  return apiClient;
};

/**
 * Api client for authenticated requests.
 * - On 401 response: attempt refresh of access using refresh token & retry request
 * @returns
 */
export const makeApiAuthClient = (accessToken: string): AxiosInstance => {
  const apiAuthClient = axios.create({
    baseURL: apiBaseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  createAuthRefreshInterceptor(apiAuthClient, refreshAuthTokenSet, {
    statusCodes: [401],
  });
  apiAuthClient.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err);
    }
  );
  return apiAuthClient;
};

/**
 * Hook that returns api client for authenticated requests.
 */
export const useApiAuthClient = (): AxiosInstance => {
  const accessToken = useRecoilValue(AccessToken);
  if (!accessToken) throw new Error('AccessToken not found.');
  return makeApiAuthClient(accessToken);
};
