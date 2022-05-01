import axios, { AxiosError, AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { toast } from 'react-hot-toast';
import { getRecoil } from 'recoil-nexus';
import { AccessToken } from '../model/auth';
import { requestApiAuthRefresh } from './auth';

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
 * Handle error responses (excluding initial 401 response)
 *
 * @param err
 */
const handleErrors = (err: AxiosError): void => {
  // Any HTTP Code which is not 2xx will be considered as error
  const statusCode = err?.response?.status;

  if (err?.request && !err?.response) {
    toast.error('Server did not respond');
  } else if (statusCode === 404) {
    window.location.href = '/404';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
  } else if ([403, 400].includes(statusCode) && err?.response?.data?.message) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    toast.error(err.response.data.message);
  } else if (statusCode === 401) {
    window.location.href = '/login';
  } else {
    toast.error('Unknown Error');
  }
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
export const makeApiAuthClient = (): AxiosInstance => {
  const accessToken = getRecoil(AccessToken);
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
