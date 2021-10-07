import axios, { AxiosResponse } from "axios";
import { selectorFamily } from "recoil";
import { EthState, EthStateInterface } from "./eth";
import { loadSessionToken } from "./localStorage";

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
      if (!hasAccount(ethState)) return null;
      if (!hasBackendUrl()) return null;

      try {
        const token = loadSessionToken(ethState.account);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}${params.endPoint}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response;
      } catch (err) {
        return {} as AxiosResponse<never>;
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
