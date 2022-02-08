import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import {
  RecoilValue,
  selectorFamily,
  SerializableParam,
  useRecoilValue,
} from 'recoil';
import { SessionToken } from './auth';
import { EthState } from './eth';

type QueryParams = {
  [key: string]: SerializableParam;
  endPoint: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
};

type QueryDataParam = {
  data: string;
};

type PatchQueryParams = QueryParams & QueryDataParam;
type PostQueryParams = QueryParams & QueryDataParam;

const parseData = function (body: string): unknown {
  try {
    const parsedBody = JSON.parse(body);
    return parsedBody;
  } catch (err) {
    throw new Error('Invalid request body format.');
  }
};

export const isResponseOk = (
  response: AxiosResponse | AxiosError | null | unknown
): response is AxiosResponse => {
  const axiosResponse = response as AxiosResponse;
  if (!axiosResponse) return false;
  return axiosResponse.status === 200;
};

export const isApiResponseAxiosError = (
  response: AxiosResponse | AxiosError | null | unknown
): response is AxiosError => {
  return (response as AxiosError).isAxiosError !== undefined;
};

/**
 * A GET request
 */
export const ApiGetQuery = selectorFamily<AxiosResponse, QueryParams>({
  key: 'ApiGetQuery',
  get: (params: QueryParams) => async (): Promise<AxiosResponse<never>> => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL not set.');
    }
    const config = {
      config: {
        ...params.config,
      },
      headers: {
        ...params.headers,
      },
    };
    const response = await axios.get(`${backendUrl}${params.endPoint}`, config);
    return response;
  },
});

/**
 * An authenticated GET request
 */
export const ApiAuthGetQuery = selectorFamily<AxiosResponse, QueryParams>({
  key: 'ApiAuthGetQuery',
  get:
    (params: QueryParams) =>
    async ({ get }): Promise<AxiosResponse<never>> => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!ethState.account) {
        throw new Error('Eth account not connected.');
      }
      if (!(typeof sessionToken === 'string')) {
        throw new Error('No session token found.');
      }
      if (!backendUrl) {
        throw new Error('Backend URL not set.');
      }

      const config = {
        config: {
          ...params.config,
        },
        headers: {
          ...params.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
      };

      const response = await axios.get(
        `${backendUrl}${params.endPoint}`,
        config
      );
      return response;
    },
});

/**
 * A POST request
 */
export const ApiPostQuery = selectorFamily<
  AxiosResponse<unknown>,
  PostQueryParams
>({
  key: 'ApiPostQuery',
  get:
    (params: PostQueryParams) => async (): Promise<AxiosResponse<unknown>> => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not set.');
      }
      const config = {
        config: {
          ...params.config,
        },
        headers: {
          ...params.headers,
        },
      };
      const response = await axios.post(
        `${backendUrl}${params.endPoint}`,
        parseData(params.data),
        config
      );
      return response;
    },
});

/**
 * An authenticated POST request
 */
export const ApiAuthPostQuery = selectorFamily<
  AxiosResponse<unknown>,
  PostQueryParams
>({
  key: 'ApiAuthPostQuery',
  get:
    (params: PostQueryParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!ethState.account) {
        throw new Error('Eth account not connected.');
      }
      if (!(typeof sessionToken === 'string')) {
        throw new Error('No session token found.');
      }
      if (!backendUrl) {
        throw new Error('Backend URL not set.');
      }

      const config = {
        config: {
          ...params.config,
        },
        headers: {
          ...params.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
      };

      const response = await axios.post(
        `${backendUrl}${params.endPoint}`,
        parseData(params.data),
        config
      );
      return response;
    },
});

/**
 * An authenticated PATCH request
 */
export const ApiAuthPatchQuery = selectorFamily<
  AxiosResponse<unknown>,
  PatchQueryParams
>({
  key: 'ApiAuthPatchQuery',
  get:
    (params: PatchQueryParams) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!ethState.account) {
        throw new Error('Eth account not connected.');
      }
      if (!(typeof sessionToken === 'string')) {
        throw new Error('No session token found.');
      }
      if (!backendUrl) {
        throw new Error('Backend URL not set.');
      }

      const config = {
        config: {
          ...params.config,
        },
        headers: {
          ...params.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
      };

      const response = await axios.patch(
        `${backendUrl}${params.endPoint}`,
        parseData(params.data),
        config
      );
      return response;
    },
});

export const handleErrors = (err: AxiosError): void => {
  // client received an error response (5xx, 4xx)
  const { request, response } = err;
  if (response) {
    if (response.status === 404) {
      window.location.href = '/404';
    }

    if ((response.data as any).error) {
      toast.error((response.data as any).error);
      return;
    }
    // TODO Handle expired JWT token
  }

  if (request) {
    // client never received a response, or request never left
    if (err.message) {
      toast.error(err.message);
      return;
    }
  }

  toast.error('Unknown error.');
};

export const ApiQuery = async (
  query: Promise<AxiosResponse<unknown>>
): Promise<AxiosResponse<unknown> | void> => {
  try {
    return await query;
  } catch (err) {
    if (isApiResponseAxiosError(err)) handleErrors(err);
    if (err instanceof Error) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Unknown error.');
      }
    }
  }
};

/**
 * Always use `useAuthApiQuery` for queries instead of `useRecoilValue`
 * to correctly handle expired JWT tokens and other error codes returned by
 * the server
 */
export const useAuthApiQuery = (recoilValue: RecoilValue<unknown>): unknown => {
  const response = useRecoilValue(recoilValue);

  if (isApiResponseAxiosError(response)) {
    handleErrors(response);
  }
  return response;
};

// export interface PaginatedResponseData {
//   docs: any[];
//   hasMore?: boolean;
//   hasNextPage?: boolean;
//   hasPrevPage?: boolean;
//   prevPage?: number;
//   nextPage?: number;
//   limit?: number;
//   totalDocs?: number;
//   totalPages?: number;
//   page?: number;
//   pagingCounter?: number;
// }
