import jwtDecode from "jwt-decode";
import { atom, selector, selectorFamily } from "recoil";
import { ApiGetQuery, ApiPostQuery } from "./api";

export const ROLE_USER = "ROLE_USER";
export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_QUANTIFIER = "ROLE_QUANTIFIER";

export interface JWT {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

// SessionToken differentiates between null and undefined
// undefined - Session token not loaded yet
// null - No session token exists
export const SessionToken = atom<string | null | undefined>({
  key: "SessionToken",
  default: undefined,
});

export const DecodedSessionToken = selector({
  key: "DecodedSessionToken",
  get: ({ get }) => {
    const token = get(SessionToken);
    if (!token) return null;
    return jwtDecode(token) as JWT;
  },
});

export const UserRoles = selector({
  key: "UserRoles",
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return null;
    return decodedToken.roles;
  },
});

export const HasRole = selectorFamily({
  key: "HasRole",
  get:
    (role: string) =>
    ({ get }) => {
      const userRoles = get(UserRoles);
      if (!userRoles) return null;
      return userRoles.includes(role);
    },
});

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
