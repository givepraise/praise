import { AxiosResponse } from 'axios';
import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { ApiGet, ApiPost } from './api';

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

/**
 * SessionToken differentiates between null and undefined
 * `undefined` - Session token not loaded yet
 * `null` - No session token exists
 */
export const SessionToken = atom<string | null | undefined>({
  key: 'SessionToken',
  default: undefined,
});

export const DecodedSessionToken = selector({
  key: 'DecodedSessionToken',
  get: ({ get }) => {
    const token = get(SessionToken);
    if (!token) return null;
    return jwtDecode(token);
  },
});

export const ActiveUserId = selector({
  key: 'ActiveUserId',
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return null;
    return (decodedToken as JWT).userId;
  },
});

export const ActiveUserRoles = selector({
  key: 'ActiveUserRoles',
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return null;
    return (decodedToken as JWT).roles;
  },
});

export const HasRole = selectorFamily({
  key: 'HasRole',
  get:
    (role: string) =>
    ({ get }): boolean => {
      const userRoles = get(ActiveUserRoles);
      if (!userRoles) throw new Error('No user roles available');
      return userRoles.includes(role);
    },
});

export type NonceRequestQuery = {
  ethereumAddress: string;
};

export const NonceQuery = selectorFamily<
  AxiosResponse<unknown>,
  NonceRequestQuery
>({
  key: 'NonceQuery',
  get:
    (params: NonceRequestQuery) =>
    ({ get }): AxiosResponse<unknown> => {
      if (!params.ethereumAddress) throw new Error('No ETH Account specified.');
      const response = get(
        ApiGet({
          url: `/api/auth/nonce?ethereumAddress=${params.ethereumAddress}`,
        })
      );
      return response;
    },
});

export type AuthRequestBody = {
  ethereumAddress: string;
  message: string;
  signature: string;
};

export const AuthQuery = selectorFamily<
  AxiosResponse<unknown>,
  AuthRequestBody
>({
  key: 'AuthQuery',
  get:
    (params: AuthRequestBody) =>
    ({ get }): AxiosResponse<unknown> => {
      if (!params.ethereumAddress || !params.message || !params.signature)
        throw new Error('invalid auth params.');
      const data = JSON.stringify({
        ethereumAddress: params.ethereumAddress,
        message: params.message,
        signature: params.signature,
      });
      const response = get(ApiPost({ url: '/api/auth', data }));
      return response;
    },
});
