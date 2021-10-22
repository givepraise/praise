import * as localStorage from "@/store/localStorage";
import axios, { AxiosError, AxiosResponse } from "axios";
import { selectorFamily, useRecoilValue, useSetRecoilState } from "recoil";
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

// Always use `useAuthRecoilValue` for queries instead of `useRecoilValue`
// to correctly handle expired JWT tokens and other error codes returned by
// the server
export const useAuthRecoilValue = (recoilValue: any) => {
  const ethState = useRecoilValue(EthState);
  const response = useRecoilValue(recoilValue) as any;
  const setSessionToken = useSetRecoilState(SessionToken);

  // DUMMY CHECK!
  // This should make a real check if session token has expired
  if (response?.data?.status === 403) {
    localStorage.removeSessionToken(ethState.account);
    setSessionToken(null);
  }

  return response;
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

export const isHttpOk = (
  response: AxiosResponse<never> | AxiosError<never> | null
): response is AxiosResponse<never> => {
  return (response as AxiosResponse<never>).status === 200;
};

export const isHttpError = (
  response: AxiosResponse<never> | AxiosError<never> | null
): response is AxiosError<never> => {
  return (response as AxiosError<never>).isAxiosError !== undefined;
};

export const getHttpError = (
  response: AxiosResponse<never> | AxiosError<never> | null
) => {
  if (!response) return null;
  const axiosError = response as AxiosError<never>;
  if (axiosError.isAxiosError && axiosError.response) {
    return axiosError.response.data as HttpError;
  }
  return null;
};

export const isApiResponseDataError = (data: any): data is ApiError => {
  if (!data) return false;
  return (data as ApiError).code !== undefined;
};

export const getApiError = (
  response: AxiosResponse<never> | AxiosError<never> | null
) => {
  if (!response) return null;
  const axiosResponse = response as AxiosResponse<never>;
  if (isApiResponseDataError(axiosResponse.data)) {
    return axiosResponse.data as ApiError;
  }
  return null;
};

// Checks response returned from API and returns ok if:
// 1. There is a response
// 2. The HTTP status code is 200
// 3. The response data is not an error message
export const isApiResponseOk = (
  response: AxiosResponse<never> | AxiosError<never> | null
) => {
  if (
    response &&
    !isHttpError(response) &&
    !isApiResponseDataError(response.data)
  ) {
    return true;
  }
  return false;
};

export const getApiResponseOkData = (
  response: AxiosResponse<never> | AxiosError<never> | null
) => {
  if (!isApiResponseOk(response)) return null;
  return (response as AxiosResponse<never>).data as any;
};
