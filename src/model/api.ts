import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import {
  atom,
  selectorFamily,
  SerializableParam,
  useRecoilValue,
} from "recoil";
import { SessionToken } from "./auth";
import { EthState, EthStateInterface } from "./eth";

type QueryParams = {
  [key: string]: SerializableParam;
  endPoint: string;
  config?: any;
  headers?: any;
};

type QueryDataParam = {
  data: string;
};

type PatchQueryParams = QueryParams & QueryDataParam;
type PostQueryParams = QueryParams & QueryDataParam;

const hasAccount = (ethState: EthStateInterface) => {
  if (!ethState.account) {
    console.error("Ethereum wallet not connected.");
    return false;
  }
  return true;
};

const hasBackendUrl = () => {
  if (!process.env.REACT_APP_BACKEND_URL) {
    console.log("Backend url not set.");
    return false;
  }
  return true;
};

const parseData = function (body: string): any {
  try {
    const parsedBody = JSON.parse(body);
    return parsedBody;
  } catch (err) {
    throw new Error("Invalid request body format.");
  }
};

export const ApiGetQuery = selectorFamily<AxiosResponse | null, QueryParams>({
  key: "ApiGetQuery",
  get: (params: QueryParams) => async () => {
    if (!hasBackendUrl()) return null;

    const config = {
      config: {
        ...params.config,
      },
      headers: {
        ...params.headers,
      },
    };
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
      config
    );
    return response;
  },
});

export const ApiAuthGetQuery = selectorFamily<
  AxiosResponse | null,
  QueryParams
>({
  key: "ApiAuthGetQuery",
  get:
    (params: QueryParams) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

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
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        config
      );
      return response;
    },
});

export const ApiPostQuery = selectorFamily<
  AxiosResponse<any> | null,
  PostQueryParams
>({
  key: "ApiPostQuery",
  get: (params: PostQueryParams) => async () => {
    if (!hasBackendUrl()) return null;
    const config = {
      config: {
        ...params.config,
      },
      headers: {
        ...params.headers,
      },
    };
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
      parseData(params.data),
      config
    );
    return response;
  },
});

export const ApiAuthPostQuery = selectorFamily<
  AxiosResponse<any> | null,
  PostQueryParams
>({
  key: "ApiAuthPostQuery",
  get:
    (params: PostQueryParams) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

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
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        parseData(params.data),
        config
      );
      return response;
    },
});

export const ApiAuthPatchQuery = selectorFamily<
  AxiosResponse<any> | null,
  PatchQueryParams
>({
  key: "ApiAuthPatchQuery",
  get:
    (params: PatchQueryParams) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

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
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        parseData(params.data),
        config
      );
      return response;
    },
});

export const handleErrors = (err: AxiosError) => {
  // client received an error response (5xx, 4xx)
  if (err.response) {
    if (err.response.status === 404) {
      window.location.href = "/404";
    }
    // TODO Handle expired JWT token
  } else if (err.request) {
    // client never received a response, or request never left
    if (err.message) {
      toast.error(err.message);
    } else {
      toast.error("Unknown error.");
    }
  } else {
    // anything else
    // TODO Add handling of other errors
  }
};

export const ApiQuery = async (query: any) => {
  try {
    return await query;
  } catch (err) {
    if (isApiResponseError(err)) handleErrors(err);
    if (err instanceof Error) {
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Unknown error.");
      }
    }
  }
};

// Always use `useAuthApiQuery` for queries instead of `useRecoilValue`
// to correctly handle expired JWT tokens and other error codes returned by
// the server
export const useAuthApiQuery = (recoilValue: any) => {
  const response = useRecoilValue(recoilValue) as any;

  if (typeof response === "undefined" || response === null) return response;

  if (isApiResponseError(response)) {
    handleErrors(response);
    return response as AxiosError;
  }
  return response as AxiosResponse;
};

export const isApiResponseOk = (
  response: AxiosResponse | AxiosError | null | unknown
): response is AxiosResponse => {
  const axiosResponse = response as AxiosResponse;
  if (!axiosResponse) return false;
  return axiosResponse.status === 200;
};

export const isApiResponseError = (
  response: AxiosResponse | AxiosError | null | unknown
): response is AxiosError => {
  return (response as AxiosError).isAxiosError !== undefined;
};

export interface PaginatedResponseData {
  docs: any[];
  hasMore?: boolean;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  prevPage?: number;
  nextPage?: number;
  limit?: number;
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
}

export const AccountActivated = atom<boolean>({
  key: "AccountActivated",
  default: false,
});

export const AccountActivateQuery = selectorFamily({
  key: "AccountActivateQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const { ethereumAddress, accountName, message, signature } = params;
      if (!ethereumAddress || !accountName || !message || !signature)
        return undefined;

      const data = JSON.stringify({
        ethereumAddress,
        accountName,
        message,
        signature,
      });

      return get(ApiPostQuery({ endPoint: "/api/activate", data }));
    },
});
