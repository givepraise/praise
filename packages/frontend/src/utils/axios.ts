import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';

const isJsonBlob = (data): data is Blob =>
  data instanceof Blob && data.type === 'application/json';

/**
 * Handle error responses (excluding initial 401 response). Any HTTP Code which is not 2xx will be considered as error
 *
 * @param err
 */
export const handleErrors = (
  err: AxiosError,
  handleErrorsAutomatically = true
): AxiosError => {
  // Handling errors automatically means the error will be displayed to the user with a toast.
  // If not handled automatically, the error will just be logged to the console and returned.
  if (!handleErrorsAutomatically) {
    console.error(err);
    return err;
  }

  if (err?.response) {
    if (err.response.status === 401) {
      // If the response is 401, it means the user is not logged in
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    }
    // If the response is a json blob, parse it and display the error message
    if (isJsonBlob(err.response.data)) {
      void (err.response.data as Blob).text().then((text) => {
        const json = JSON.parse(text);
        toast.error(json.message);
      });
    } else if ((err.response.data as Error).message) {
      toast.error((err.response.data as Error).message);
    } else {
      toast.error('Something went wrong');
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
export const makeClient = (handleErrorsAutomatically = true): AxiosInstance => {
  const client = axios.create();

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      return handleErrors(err, handleErrorsAutomatically);
    }
  );
  return client;
};
