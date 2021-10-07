import { selectorFamily } from "recoil";
import { ApiGetQuery, ApiPostQuery } from ".";

export const NonceQuery = selectorFamily({
  key: "NonceQuery",
  get:
    (params: any) =>
    async ({ get }) => {
      const response = get(
        ApiGetQuery({
          endPoint: `/api/auth/nonce?ethereumAddress=${params.ethAccount}`,
        })
      );
      const data = response?.data as any;
      return data?.nonce;
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

      const response = get(ApiPostQuery({ endPoint: "/api/auth", data }));
      return response?.data;
    },
});
