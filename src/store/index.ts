import axios, { AxiosRequestConfig } from "axios";
import { atom, selectorFamily } from "recoil";

const apiGet = async (endPoint: string) => {
  if (!process.env.REACT_APP_BACKEND_URL) {
    console.log("BACKEND URL NOT SET");
  }
  return axios.get(endPoint, {
    baseUrl: `${!process.env.REACT_APP_BACKEND_URL}`,
  } as AxiosRequestConfig);
};

export const LoginNonceState = atom({
  key: "LoginNonceState",
  default: undefined,
});

export const NonceQuery = selectorFamily({
  key: "NonceQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      let response = await apiGet(
        `/api/auth/nonce?publicKey=${params.ethAccount}`
      );
      console.log(JSON.stringify(response));
      //return response!.nonce;
      return "1234";
    },
});
