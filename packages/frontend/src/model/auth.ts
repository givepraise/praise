import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { isExpired, JWT } from '../utils/jwt';
import { recoilPersist } from 'recoil-persist';
import { TokenSet } from 'api/dist/auth/types';
const { persistAtom } = recoilPersist();

export const ROLE_USER = 'USER';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_QUANTIFIER = 'QUANTIFIER';

export const ActiveTokenSet = atom<TokenSet | undefined>({
  key: 'ActiveTokenSet',
  default: undefined,
  effects_UNSTABLE: [persistAtom],
});

export const AccessToken = selector<string>({
  key: 'AccessToken',
  //eslint-disable-next-line
  // @ts-ignore
  get: ({ get }) => {
    const tokens = get(ActiveTokenSet);
    if (!tokens) return undefined;
    if (isExpired(tokens.accessToken)) return undefined;

    return tokens.accessToken;
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

export const DecodedAccessToken = selector({
  key: 'DecodedAccessToken',
  get: ({ get }) => {
    const accessToken = get(AccessToken);
    if (!accessToken) return undefined;
    return jwtDecode(accessToken);
  },
});

export const ActiveUserId = selector({
  key: 'ActiveUserId',
  get: ({ get }) => {
    const decodedToken = get(DecodedAccessToken);
    if (!decodedToken) return undefined;
    return (decodedToken as JWT).userId;
  },
});

export const ActiveUserRoles = selector({
  key: 'ActiveUserRoles',
  get: ({ get }) => {
    const decodedToken = get(DecodedAccessToken);
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
