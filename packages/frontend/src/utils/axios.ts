import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';
import { isAppError } from 'api/dist/error/utils';
import { AppError } from 'api/dist/error/types';

/**
 * Handle error responses (excluding initial 401 response). Any HTTP Code which is not 2xx will be considered as error
 *
 * @param err
 */
export const handleErrors = (err: AxiosError): AxiosError => {
  // Any HTTP Code which is not 2xx will be considered as error
  const statusCode = err?.response?.status;

  if (err?.request && !err?.response) {
    toast.error('Server did not respond');
  } else if (err.response.status === 404) {
    // Resource not found
    // Redirect to 404 page
    window.location.href = '/404';
  } else if ([403, 400].includes(err.response.status)) {
    // Forbidden or bad request
    const isJsonBlob = (data): data is Blob =>
      data instanceof Blob && data.type === 'application/json';
    // If the response is a json blob, parse it and display the error message
    if (isJsonBlob(err.response.data)) {
      void (err.response.data as Blob).text().then((text) => {
        const json = JSON.parse(text);
        toast.error(json.message);
      });
    } else if (isAppError(err.response.data)) {
      toast.error((err.response.data as AppError).message);
    } else {
      toast.error('Something went wrong');
    }
  } else if (err.response.status === 401) {
    // Unauthorized
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
