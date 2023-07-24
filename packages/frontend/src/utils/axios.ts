import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';
import { requestApiRefreshToken } from '@/utils/auth';

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
  let refreshToken;
  const recoilPersist = localStorage.getItem('recoil-persist');
  if (recoilPersist) {
    refreshToken = JSON.parse(recoilPersist)?.ActiveTokenSet?.refreshToken;
  }

  if (
    refreshToken &&
    recoilPersist &&
    err?.response?.status === 401 &&
    // 1092, 1107 are the error codes for invalid jwt token that defined in backend
    (err?.response?.data?.code === 1092 || err?.response?.data?.code === 1107)
  ) {
    // delete the old token from localStorage to prevent infinite loop
    delete recoilPersist['ActiveTokenSet'];
    localStorage.setItem(JSON.stringify(recoilPersist), 'recoil-persist');
    try {
      await requestApiRefreshToken({ refreshToken });
      toast('Please try again');
      return err;
    } catch (error) {
      console.log(
        'refresh accessToken error',
        (error as AxiosError)?.response?.data
      );
    }
  }

  // Handling errors automatically means the error will be displayed to the user with a toast.
  // If not handled automatically, the error will just be logged to the console and returned.
  if (!handleErrorsAutomatically) {
    console.error(err);
    return err;
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
