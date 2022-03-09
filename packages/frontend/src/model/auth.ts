import { AuthResponse } from 'api/dist/auth/types';
import { AxiosResponse } from 'axios';
import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { ApiGet, ApiPost } from './api';

export const ROLE_USER = 'USER';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_QUANTIFIER = 'QUANTIFIER';
export const LOCALSTORAGE_KEY = 'praise';

export interface JWT {
  sub: string;
  userId: string;
  ethereumAddress: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface TokenSet {
  sessionToken: string; // TODO: rename to accessToken
  refreshToken: string;
}

export const ActiveTokenSet = atom<TokenSet | undefined>({
  key: 'ActiveTokenSet',
  default: undefined,
});

export const SessionToken = selector<string>({
  key: 'SessionToken',
  //eslint-disable-next-line
  // @ts-ignore
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;

    // Check if stored session token is expired
    const decodedSessionToken: JWT = jwtDecode(tokens.sessionToken);
    const currentDatetimeSeconds = new Date().getTime() / 1000;
    if (currentDatetimeSeconds >= Number(decodedSessionToken.exp))
      return undefined;

    return tokens.sessionToken;
  },
});

export const DecodedSessionToken = selector({
  key: 'DecodedSessionToken',
  get: ({ get }) => {
    const sessionToken = get(SessionToken);
    if (!sessionToken) return undefined;
    return jwtDecode(sessionToken);
  },
});

export const ActiveUserId = selector({
  key: 'ActiveUserId',
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return undefined;
    return (decodedToken as JWT).userId;
  },
});

export const ActiveUserRoles = selector({
  key: 'ActiveUserRoles',
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return undefined;
    return (decodedToken as JWT).roles;
  },
});

export const HasRole = selectorFamily({
  key: 'HasRole',
  get:
    (role: string) =>
    ({ get }): boolean | undefined => {
      const userRoles = get(ActiveUserRoles);
      if (!userRoles) return undefined;
      return userRoles.includes(role);
    },
});

export const NonceQuery = selectorFamily<
  AxiosResponse<unknown> | undefined,
  string | null | undefined
>({
  key: 'NonceQuery',
  get:
    (ethereumAddress: string | null | undefined) =>
    ({ get }): AxiosResponse<unknown> | undefined => {
      if (!ethereumAddress) return undefined;
      return get(
        ApiGet({
          url: `/api/auth/nonce?ethereumAddress=${ethereumAddress}`,
        })
      );
    },
});

export type AuthQueryParams = {
  ethereumAddress: string | null | undefined;
  message: string | undefined;
  signature: string | undefined;
};

export const AuthQuery = selectorFamily<
  AxiosResponse<unknown> | undefined,
  AuthQueryParams
>({
  key: 'AuthQuery',
  get:
    (params: AuthQueryParams) =>
    ({ get }): AxiosResponse<unknown> | undefined => {
      const { ethereumAddress, message, signature } = params;
      if (!ethereumAddress || !message || !signature) return undefined;
      const data = JSON.stringify(params);
      return get(ApiPost({ url: '/api/auth', data }));
    },
});
