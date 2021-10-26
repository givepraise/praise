import axios, { AxiosError, AxiosResponse } from "axios";
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

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
          params.headers
        );
        return response as AxiosResponse;
      } catch (err) {
        return err as AxiosError;
      }
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

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
          { headers: { Authorization: `Bearer ${sessionToken}` } }
        );
        return response as AxiosResponse;
      } catch (err) {
        return err as AxiosError;
      }
    },
});

export const ApiPostQuery = selectorFamily({
  key: "ApiPostQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!hasBackendUrl()) return null;

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
          params.data
        );
        return response as AxiosResponse;
      } catch (err) {
        return err as AxiosError;
      }
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

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
          params.data,
          { headers: { Authorization: `Bearer ${sessionToken}` } }
        );
        return response as AxiosResponse;
      } catch (err) {
        return err as AxiosError;
      }
    },
});

// Always use `useAuthApiQuery` for queries instead of `useRecoilValue`
// to correctly handle expired JWT tokens and other error codes returned by
// the server
export const useAuthApiQuery = (recoilValue: any) => {
  //const ethState = useRecoilValue(EthState);
  const response = useRecoilValue(recoilValue) as any;
  //const setSessionToken = useSetRecoilState(SessionToken);

  if (typeof response === "undefined" || response === null) return response;

  if (isApiResponseError(response)) {
    const err = response as AxiosError;
    if (err.response) {
      // client received an error response (5xx, 4xx)
      return err;
    } else if (err.request) {
      // client never received a response, or request never left
      // TODO Add handling of no response
      return err;
    } else {
      // anything else
      // TODO Add handling of other errors
      return err;
    }
  }

  // DUMMY CHECK!
  // This should make a real check if session token has expired
  // if (response?.data?.status === 403) {
  //   localStorage.removeSessionToken(ethState.account);
  //   setSessionToken(null);
  // }

  return response as AxiosResponse;
};

export interface ApiError {
  code: number;
  uri: string;
  message: string;
  errors: string[];
}

export interface HttpError {
  error: string;
  path: string;
  status: number;
  timestamp: string;
}

export const isApiErrorData = (data: any): data is ApiError => {
  if (!data) return false;
  return (data as ApiError).code !== undefined;
};

export const isHttpErrorData = (data: any): data is HttpError => {
  if (!data) return false;
  return (data as HttpError).error !== undefined;
};

export const isApiResponseOk = (
  response: AxiosResponse | AxiosError | null
): response is AxiosResponse => {
  return (response as AxiosResponse).status === 200;
};

export const isApiResponseError = (
  response: AxiosResponse | AxiosError | null
): response is AxiosError => {
  return (response as AxiosError).isAxiosError !== undefined;
};

export const getHttpError = (response: AxiosResponse | AxiosError | null) => {
  if (!response || !isApiResponseError(response)) return null;
  const axiosError = response as AxiosError;
  if (axiosError.response && isHttpErrorData(axiosError.response.data)) {
    return axiosError.response.data as HttpError;
  }
  if (axiosError.message) {
    return {
      error: axiosError.message,
      path: axiosError.config.url,
      status: 0,
      timestamp: "",
    } as HttpError;
  }
  return null;
};

export const getApiError = (response: AxiosResponse | AxiosError | null) => {
  if (!response) return null;
  if (isApiResponseOk(response)) {
    const axiosResponse = response as AxiosResponse;
    if (isApiErrorData(axiosResponse.data)) {
      return axiosResponse.data as ApiError;
    }
  }
  if (isApiResponseError(response)) {
    const axiosError = response as AxiosError;
    if (axiosError.response && isApiErrorData(axiosError.response?.data)) {
      return axiosError.response?.data as ApiError;
    }
  }
  return null;
};
