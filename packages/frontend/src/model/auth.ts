import EthAccount from '@/pages/Activate/components/EthAccount';
import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { ApiGetQuery, ApiPostQuery } from './api';

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

export interface Nonce {
  ethereumAddress: string;
  nonce: string;
}

export interface Auth {
  ethereumAddress: string;
  accessToken: string;
  tokenType: string;
}

// SessionToken differentiates between null and undefined
// undefined - Session token not loaded yet
// null - No session token exists
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
    return (decodedToken as any).userId;
  },
});

export const ActiveUserRoles = selector({
  key: 'ActiveUserRoles',
  get: ({ get }) => {
    const decodedToken = get(DecodedSessionToken);
    if (!decodedToken) return null;
    return (decodedToken as any).roles;
  },
});

export const HasRole = selectorFamily({
  key: 'HasRole',
  get:
    (role: string) =>
    ({ get }) => {
      const userRoles = get(ActiveUserRoles);
      if (!userRoles) return null;
      return userRoles.includes(role);
    },
});

interface NonceParams {
  ethAccount: string;
}

export const NonceQuery = selectorFamily({
  key: 'NonceQuery',
  get:
    (params: NonceParams) =>
    ({ get }) => {
      if (!params.ethAccount) return null;
      return get(
        ApiGetQuery({
          endPoint: `/api/auth/nonce?ethereumAddress=${params.ethAccount}`,
        })
      );
    },
});

export const AuthQuery = selectorFamily({
  key: 'AuthQuery',
  get:
    (params: any) =>
    ({ get }) => {
      if (!params.ethAccount || !params.message || !params.signature)
        return undefined;

      const data = JSON.stringify({
        ethereumAddress: params.ethAccount,
        message: params.message,
        signature: params.signature,
      });

      return get(ApiPostQuery({ endPoint: '/api/auth', data }));
    },
});
