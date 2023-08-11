import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';
import { requestApiRefreshToken } from '@/utils/auth';
import { getRecoil, setRecoil } from 'recoil-nexus';
import { ActiveTokenSet } from '../model/auth/auth';

const isJsonBlob = (data): data is Blob =>
  data instanceof Blob && data.type === 'application/json';

/**
 * Handle error responses (excluding initial 401 response). Any HTTP Code which is not 2xx will be considered as error
 *
 * @param err
 */
export const handleErrors = async (
  err: AxiosError<{
    code: number;
    message: string;
    statusCode: number;
  }>,
  handleErrorsAutomatically = true
): Promise<
  AxiosError<{
    code: number;
    message: string;
    statusCode: number;
  }>
> => {
  // Handling errors automatically means the error will be displayed to the user with a toast.
  // If not handled automatically, the error will just be logged to the console and returned.
  if (!handleErrorsAutomatically) {
    console.error(err);
    throw err;
  }

  // If the error is a 401 and expired jwt token, try to refresh the token
  if (err?.response?.status === 401 && err?.response?.data?.code === 1107) {
    // 1107 are the error code for expired jwt token that defined in backend
    const tokenSet = getRecoil(ActiveTokenSet);
    if (!tokenSet) {
      // Unlikely scenario: API returns 401 but no token set is available
      return err;
    }
    try {
      await requestApiRefreshToken({ refreshToken: tokenSet.refreshToken });
      return err;
    } catch (error) {
      console.error('Refresh JWT token failed', error);
      setRecoil(ActiveTokenSet, undefined);
    }
  }

  if (err?.response) {
    // If the response is a json blob, parse it and display the error message
    if (isJsonBlob(err.response.data)) {
      void (err.response.data as Blob).text().then((text) => {
        const json = JSON.parse(text);
        toast.error(json.message);
      });
    } else if (err.response.data.message) {
      toast.error(err.response.data.message);
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
