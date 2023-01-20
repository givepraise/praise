import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Handle error responses (excluding initial 401 response). Any HTTP Code which is not 2xx will be considered as error
 *
 * @param err
 */
export const handleErrors = (err: AxiosError): AxiosError => {
  // Any HTTP Code which is not 2xx will be considered as error

  const isJsonBlob = (data): data is Blob =>
    data instanceof Blob && data.type === 'application/json';

  const displayMessageOrDefault = (
    err: AxiosError,
    defaultMessage: string
  ): void => {
    if (err.response) {
      if (isJsonBlob(err.response.data)) {
        void (err.response.data as Blob).text().then((text) => {
          const json = JSON.parse(text);
          toast.error(json.message);
        });
      } else if ((err.response.data as Error).message) {
        toast.error((err.response.data as Error).message);
      }
    } else {
      toast.error(defaultMessage);
    }
  };

  if (err?.response) {
    const statusCode = err.response.status;
    if (statusCode === 404) {
      // Resource not found
      // Redirect to 404 page
      window.location.href = '/404';
    } else if (statusCode === 400) {
      displayMessageOrDefault(err, 'Bad request');
    } else if (statusCode === 401) {
      // Unauthorized
      window.location.href = '/';
    } else if (statusCode === 403) {
      displayMessageOrDefault(err, 'Forbidden');
    } else if (statusCode === 500) {
      displayMessageOrDefault(err, 'Internal Server Error');
    } else {
      toast.error('Unknown Error');
    }
  } else if (!err.response) {
    toast.error('Server did not respond');
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
