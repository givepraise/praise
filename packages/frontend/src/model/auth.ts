import { AxiosResponse } from 'axios';
import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { isExpired, JWT } from '../utils/jwt';
import { makeApiClient } from '../utils/api';
import { recoilPersist } from 'recoil-persist';
import { AuthResponse } from 'api/dist/auth/types';
const { persistAtom } = recoilPersist();

export const ROLE_USER = 'USER';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_QUANTIFIER = 'QUANTIFIER';

export interface TokenSet {
  sessionToken: string; // TODO: rename to accessToken
  refreshToken: string;
}

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
});

export const RefreshToken = selector<string>({
  key: 'RefreshToken',
  //eslint-disable-next-line
  // @ts-ignore
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;
    if (isExpired(tokens.refreshToken)) return undefined;

    return tokens.refreshToken;
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
