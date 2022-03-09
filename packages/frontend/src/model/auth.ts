import { AxiosResponse } from 'axios';
import jwtDecode from 'jwt-decode';
import { atom, DefaultValue, selector, selectorFamily } from 'recoil';
import { ApiGet, ApiPost } from './api';
import { AuthResponse } from 'api/dist/auth/types';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const ROLE_USER = 'USER';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_QUANTIFIER = 'QUANTIFIER';

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

/**
 * ActiveTokenSet differentiates between null and undefined
 * `undefined` - tokens not loaded yet
 * `null` - No tokens exists
 */
export const ActiveTokenSet = atom<TokenSet | undefined>({
  key: 'ActiveTokenSet',
  default: undefined,
  effects_UNSTABLE: [persistAtom],
});

export const SessionToken = selector<string>({
  key: 'SessionToken',
  //eslint-disable-next-line
  // @ts-ignore
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;
    return tokens.sessionToken;
  },
  set: ({ get, set }, newValue: string) => {
    const tokens = get(ActiveTokenSet);

    if (tokens) {
      set(ActiveTokenSet, {
        ...tokens,
        sessionToken: newValue,
      });
    }
  },
});

export const DecodedSessionToken = selector({
  key: 'DecodedSessionToken',
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens || !tokens.sessionToken) return undefined;
    return jwtDecode(tokens.sessionToken);
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
