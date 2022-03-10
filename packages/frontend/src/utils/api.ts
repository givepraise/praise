import axios, { AxiosInstance, AxiosError } from 'axios';
import { getRecoil } from 'recoil-nexus';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { SessionToken } from '../model/auth';
import { toast } from 'react-hot-toast';
import { requestApiAuthRefresh } from './auth';
import { ApiErrorResponseData, ErrorInterface } from 'api/src/error/types';

// Attempt to refresh auth token and retry request
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthTokenSet = async (err: AxiosError): Promise<void> => {
  if (!err?.response?.config?.headers)
    throw Error('Error response has no headers');
  const tokenSet = await requestApiAuthRefresh();
  if (!tokenSet) return;

  err.response.config.headers[
    'Authorization'
  ] = `Bearer ${tokenSet.sessionToken}`;
};

// Handle error responses
const handleErrors = (err: AxiosError): void => {
  // Any HTTP Code which is not 2xx will be considered as error
  if (!err?.response) return;

  const statusCode = err.response.status;
  if (statusCode === 404) {
    window.location.href = '/404';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
  } else if ([403, 400].includes(statusCode) && err?.response?.data?.errors) {
    const apiErrors: ErrorInterface[] = Object.values(
      (err.response.data as ApiErrorResponseData).errors
    );

    apiErrors.forEach((apiError) => {
      toast.error(apiError.message);
    });
  } else {
    toast.error('Unknown error.');
  }
};

// Api client for unathenticated requests
export const makeApiClient = (): AxiosInstance => {
  if (!process.env.REACT_APP_BACKEND_URL)
    throw new Error('Backend URL not set.');

  const apiClient = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api/`,
  });
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err);
    }
  );
  return apiClient;
};

// Api client for authenticated requests
//  on 401 response: attempt refresh of access using refresh token & retry request
export const makeApiAuthClient = (): AxiosInstance => {
  if (!process.env.REACT_APP_BACKEND_URL)
    throw new Error('REACT_APP_BACKEND_URL not defined');

  const sessionToken = getRecoil(SessionToken);
  if (!sessionToken) throw new Error('Session Token not found');

  const apiAuthClient = axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_URL}/api/`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
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
