import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Handle error responses (excluding initial 401 response)
 *
 * @param err
 */
export const handleErrors = (err: AxiosError): AxiosError => {
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
    window.location.href = '/';
  } else {
    toast.error('Unknown Error');
  }
  return err;
};

/**
 * Client for external requests.
 * @returns
 */
export const makeClient = (): AxiosInstance => {
  const client = axios.create();

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err);
    }
  );
  return client;
};
