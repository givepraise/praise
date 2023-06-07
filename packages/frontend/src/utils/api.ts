import axios, { AxiosInstance } from 'axios';
import { useRecoilValue } from 'recoil';
import { AccessToken } from '@/model/auth/auth';
import { handleErrors } from './axios';

/**
 * We assume the API to be running on the same domain in production currently.
 * Why? The frontend is built as a static website and cannot easily accept
 * env variables. There are workarounds but we haven't prioritised to implement them yet.
 *
 * One example: https://jakobzanker.de/blog/inject-environment-variables-into-a-react-app-docker-on-runtime/
 */
export const apiBaseURL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : `${process.env.REACT_APP_SERVER_URL as string}/api`;

/**
 * Api client for unathenticated requests
 *
 * @returns
 */
export const makeApiClient = (
  handleErrorsAutomatically = true
): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: apiBaseURL,
  });
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err, handleErrorsAutomatically);
    }
  );
  return apiClient;
};

/**
 * Api client for authenticated requests.
 * - On 401 response: attempt refresh of access using refresh token & retry request
 * @returns
 */
export const makeApiAuthClient = (
  accessToken: string,
  handleErrorsAutomatically = true
): AxiosInstance => {
  const apiAuthClient = axios.create({
    baseURL: apiBaseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  apiAuthClient.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err, handleErrorsAutomatically);
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
