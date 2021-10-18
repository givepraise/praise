import * as localStorage from "@/store/localStorage";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  RecoilValue,
  selectorFamily,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
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
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`
        );
        return response;
      } catch (err) {
        return {} as AxiosResponse<never>;
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
        return response;
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
        return response;
      } catch (err) {
        return {} as AxiosResponse<never>;
      }
    },
});

export const useAuthApiQuery = (
  recoilValue: RecoilValue<AxiosResponse<never> | AxiosError<never> | null>
) => {
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
