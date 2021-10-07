import { loadSessionToken } from "@/spring/auth";
import axios from "axios";
import { atom, selectorFamily } from "recoil";

const apiGet = async (endPoint: string) => {
  if (!process.env.REACT_APP_BACKEND_URL) {
    console.log("BACKEND URL NOT SET");
  }

  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}${endPoint}`
    );
    return response;
  } catch (err) {
    return {};
  }
};

const apiAuthGet = async (endPoint: string, ethAccount: string) => {
  if (!process.env.REACT_APP_BACKEND_URL) {
    console.log("BACKEND URL NOT SET");
  }

  try {
    const token = loadSessionToken(ethAccount);
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}${endPoint}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response;
  } catch (err) {
    return {};
  }
};

const apiPost = async (endPoint: string, data: any) => {
  if (!process.env.REACT_APP_BACKEND_URL) {
    console.log("BACKEND URL NOT SET");
  }

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}${endPoint}`,
      data
    );
    return response;
  } catch (err) {
    return {};
  }
};

interface EthStateInterface {
  account: string | null | undefined;
  triedEager: boolean;
  activating: boolean;
  connected: boolean;
  connectDisabled: boolean;
}

export const EthState = atom({
  key: "EthState",
  default: {
    account: undefined,
    triedEager: false,
    activating: false,
    connected: false,
    connectDisabled: false,
  } as EthStateInterface,
});

export const NonceQuery = selectorFamily({
  key: "NonceQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const response = (await apiGet(
        `/api/auth/nonce?ethereumAddress=${params.ethAccount}`
      )) as any;

      // ADD ERROR HANDLING
      // ADD TYPE CHECKING
      return response?.data?.nonce;
    },
});

export const AuthQuery = selectorFamily({
  key: "AuthQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      if (!params.ethAccount || !params.message || !params.signature)
        return undefined;

      const data = {
        ethereumAddress: params.ethAccount,
        message: params.message,
        signature: params.signature,
      };
      const response = (await apiPost(`/api/auth`, data)) as any;

      // ADD ERROR HANDLING
      // ADD TYPE CHECKING
      return response?.data;
    },
});

export const AllUsersQuery = selectorFamily({
  key: "AllUsersQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      //const ethAccount = get(CurrentEthAddressState);
      const ethState = get(EthState);
      if (!ethState.account) return null;
      const response = (await apiAuthGet(
        `/api/admin/users/all`,
        ethState.account
      )) as any;

      // ADD ERROR HANDLING
      // ADD TYPE CHECKING
      return response?.data;
    },
});
