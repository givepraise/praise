import jwtDecode from 'jwt-decode';
import { atom, selector, selectorFamily } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { SingleUser } from '../user/users';
import { UserRole } from 'shared/enums/user-role.enum';
import { TokenSet } from 'shared/interfaces/token-set.interface';
import { JwtTokenData } from 'shared/interfaces/jwt-token-data.interface';

const { persistAtom } = recoilPersist();

export const ROLE_ADMIN = UserRole.ADMIN;
export const ROLE_QUANTIFIER = UserRole.QUANTIFIER;

export const ActiveTokenSet = atom<TokenSet | undefined>({
  key: 'ActiveTokenSet',
  default: undefined,
  effects: [persistAtom],
});

export const AccessToken = selector<string | undefined>({
  key: 'AccessToken',
  get: ({ get }) => {
    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) return;

    return activeTokenSet.accessToken;
  },
});

export const DecodedAccessToken = selector<JwtTokenData | undefined>({
  key: 'DecodedAccessToken',
  get: ({ get }) => {
    const accessToken = get(AccessToken);
    if (!accessToken) return;

    return jwtDecode(accessToken);
  },
});

export const ActiveUserId = selector<string | undefined>({
  key: 'ActiveUserId',
  get: ({ get }) => {
    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) return;

    const decodedToken = get(DecodedAccessToken);
    if (!decodedToken) return;

    return decodedToken.userId;
  },
});

export const ActiveUserRoles = selector<string[]>({
  key: 'ActiveUserRoles',
  get: ({ get }): string[] => {
    const user = get(SingleUser(get(ActiveUserId)));
    if (user) return user.roles;

    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) return [];

    const decodedToken = get(DecodedAccessToken);
    if (!decodedToken) return [];

    return decodedToken.roles;
  },
});

export const HasRole = selectorFamily({
  key: 'HasRole',
  get:
    (role: string) =>
    ({ get }): boolean => {
      const userRoles = get(ActiveUserRoles);

      return userRoles.includes(role);
    },
});
