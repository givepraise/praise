import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { selectorFamily, useRecoilValue } from "recoil";
import { SessionToken } from "./auth";
import { EthState, EthStateInterface } from "./eth";

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

export const ApiGetQuery = selectorFamily({
  key: "ApiGetQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!hasBackendUrl()) return null;

      return await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        params.headers
      );
    },
});

export const ApiAuthGetQuery = selectorFamily({
  key: "ApiAuthGetQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

      const config = {
        ...params.config,
        headers: { Authorization: `Bearer ${sessionToken}` },
      };
      return await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        config
      );
    },
});

export const ApiPostQuery = selectorFamily({
  key: "ApiPostQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!hasBackendUrl()) return null;

      return await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        params.data
      );
    },
});

export const ApiAuthPostQuery = selectorFamily({
  key: "ApiAuthPostQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

      return await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        params.data,
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
    },
});

export const ApiAuthPatchQuery = selectorFamily({
  key: "ApiAuthPatchQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const ethState = get(EthState);
      const sessionToken = get(SessionToken);
      if (!hasAccount(ethState) || !sessionToken || !hasBackendUrl())
        return null;

      return await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
        params.data,
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
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
    return err;
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
