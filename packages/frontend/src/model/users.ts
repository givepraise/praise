import { UserDto, UserRole } from 'api/dist/user/types';
import { AxiosError, AxiosResponse } from 'axios';
import { atom, selector, selectorFamily, useRecoilState } from 'recoil';
import { pseudonymNouns, psudonymAdjectives } from '@/utils/users';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';
import { AllPeriods } from './periods';

export const AllUsers = atom<UserDto[] | undefined>({
  key: 'AllUsers',
  default: undefined,
  effects: [
    ({ setSelf, trigger, getPromise }): void => {
      if (trigger === 'get') {
        const apiGet = async (): Promise<void> => {
          const response = await getPromise(
            ApiAuthGet({
              url: 'users/all?sortColumn=ethereumAddress&sortType=desc',
            })
          );
          if (isResponseOk(response)) {
            const users = response.data as UserDto[];
            if (Array.isArray(users) && users.length > 0) setSelf(users);
          }
        };
        void apiGet();
      }
    },
  ],
});

export const AllAdminUsers = selector({
  key: 'AllAdminUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) => user.roles.includes(UserRole.ADMIN));
    }
    return undefined;
  },
});

export const AllQuantifierUsers = selector({
  key: 'AllQuantifierUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) => user.roles.includes(UserRole.QUANTIFIER));
    }
    return undefined;
  },
});

export const AllForwarderUsers = selector({
  key: 'AllForwarderUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) => user.roles.includes(UserRole.FORWARDER));
    }
    return undefined;
  },
});

const stringToNumber = (s: string): number => {
  let value = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    value = value * 256 + s.charCodeAt(i);
  }
  return value;
};

type PseudonymForUserParams = {
  periodId: string;
  userId: string;
};
export const PseudonymForUser = selectorFamily({
  key: 'PseudonymForUser',
  get:
    (params: PseudonymForUserParams) =>
    ({ get }): string => {
      const { periodId, userId } = params;
      const allPeriods = get(AllPeriods);
      if (!allPeriods) return 'Loading…';
      const periodIndex = allPeriods.findIndex((p) => p._id === periodId);

      if (userId && periodIndex > -1) {
        const u = stringToNumber(userId);
        const p = stringToNumber(periodId);
        const n = pseudonymNouns[(u + p) % pseudonymNouns.length];
        const a = psudonymAdjectives[(u + p) % psudonymAdjectives.length];
        return `${a} ${n}`;
      }

      return 'Unknown user';
    },
});

/**
 * Types for `useParams()`
 */
export type SingleUserParams = {
  userId: string | undefined;
};

export const SingleUser = selectorFamily({
  key: 'SingleUser',
  get:
    (userId: string | undefined) =>
    ({ get }): UserDto | undefined => {
      const allUsers = get(AllUsers);
      if (!allUsers) return undefined;
      return allUsers.filter((user) => user._id === userId)[0];
    },
});

type useAdminUsersReturns = {
  addRole: (
    userId: string,
    role: UserRole
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
  removeRole: (
    userId: string,
    role: UserRole
  ) => Promise<AxiosResponse<unknown> | AxiosError<unknown>>;
};

export const useAdminUsers = (): useAdminUsersReturns => {
  const apiAuthClient = useApiAuthClient();
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  const patchRole = async (
    endpoint: 'addRole' | 'removeRole',
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
    const response = await apiAuthClient.patch(
      `/admin/users/${userId}/${endpoint}`,
      {
        role,
      }
    );
    if (isResponseOk(response)) {
      const user = response.data as UserDto;
      if (user && typeof allUsers !== 'undefined') {
        setAllUsers(
          allUsers.map((oldUser) => (oldUser._id === user._id ? user : oldUser))
        );
      }
    }
    return response;
  };

  const addRole = async (
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
    return patchRole('addRole', userId, role);
  };

  const removeRole = async (
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<unknown> | AxiosError<unknown>> => {
    return patchRole('removeRole', userId, role);
  };

  return { addRole, removeRole };
};
