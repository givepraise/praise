import { UserDto, UserRole } from 'api/dist/user/types';
import { AxiosError, AxiosResponse } from 'axios';
import { atom, selector, selectorFamily, useRecoilState } from 'recoil';
import { pseudonymNouns, psudonymAdjectives } from '@/utils/users';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from './api';
import { AllPeriods } from './periods';

interface roleOptionsProps {
  value: string;
  label: string;
}

export const roleOptions = [
  { label: 'All users', value: UserRole.USER },
  { label: 'Admins', value: UserRole.ADMIN },
  { label: 'Forwarders', value: UserRole.FORWARDER },
  { label: 'Quantifiers', value: UserRole.QUANTIFIER },
];

export const AllUsers = atom<UserDto[] | undefined>({
  key: 'AllUsers',
  default: undefined,
  effects: [
    ({ setSelf, getPromise }): void => {
      setSelf(
        getPromise(
          ApiAuthGet({
            url: 'users/all?sortColumn=identityEthAddress&sortType=desc',
          })
        ).then((response) => {
          if (isResponseOk(response)) {
            const users = response.data as UserDto[];
            if (Array.isArray(users) && users.length > 0) return users;
          }
        })
      );
    },
  ],
});

export const UsersTableData = atom<UserDto[] | undefined>({
  key: 'UsersTableData',
  default: undefined,
});

export const UsersTableSelectedRole = atom<roleOptionsProps>({
  key: 'UsersTableSelectedRole',
  default: roleOptions[0],
});

export const UsersTableFilter = atom<string>({
  key: 'UsersTableFilter',
  default: '',
});

export const UsersTablePage = atom<number>({
  key: 'UsersTablePage',
  default: 1,
});

export const UsersTableLastPage = atom<number>({
  key: 'UsersTableLastPage',
  default: 0,
});

export const AllAdminUsers = selector({
  key: 'AllAdminUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (Array.isArray(users) && users.length > 0) {
      return users.filter((user) => user.roles.includes(UserRole.ADMIN));
    }
  },
});

export const AllQuantifierUsers = selector({
  key: 'AllQuantifierUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (Array.isArray(users) && users.length > 0) {
      return users.filter((user) => user.roles.includes(UserRole.QUANTIFIER));
    }
  },
});

export const AllForwarderUsers = selector({
  key: 'AllForwarderUsers',
  get: ({ get }) => {
    const users = get(AllUsers);
    if (Array.isArray(users) && users.length > 0) {
      return users.filter((user) => user.roles.includes(UserRole.FORWARDER));
    }
  },
});

type PseudonymForUserParams = {
  periodId: string;
  userId: string;
};
export const PseudonymForUser = selectorFamily({
  key: 'PseudonymForUser',
  get:
    (params: PseudonymForUserParams) =>
    ({ get }): string | undefined => {
      const { periodId, userId } = params;
      const allPeriods = get(AllPeriods);
      if (!allPeriods) return 'Loading…';
      const periodIndex = allPeriods.findIndex((p) => p._id === periodId);

      const stringToNumber = (s: string): number => {
        let value = 0;
        for (let i = s.length - 1; i >= 0; i--) {
          value = value * 256 + s.charCodeAt(i);
        }
        return value;
      };

      if (userId && periodIndex > -1) {
        const u = stringToNumber(userId);
        const p = stringToNumber(periodId);
        const n = pseudonymNouns[(u + p) % pseudonymNouns.length];
        const a = psudonymAdjectives[(u + p) % psudonymAdjectives.length];
        return `${a} ${n}`;
      }
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
      return allUsers.find((user) => user._id === userId);
    },
});

export const ManyUsers = selectorFamily({
  key: 'ManyUsers',
  get:
    (userIds: string[] | undefined) =>
    ({ get }): (UserDto | undefined)[] | undefined => {
      const allUsers = get(AllUsers);
      if (!allUsers || !userIds) return undefined;
      return userIds.map((userId) =>
        allUsers.find((user) => user._id === userId)
      );
    },
});

type useAdminUsersReturns = {
  addRole: (
    userId: string,
    role: UserRole
  ) => Promise<AxiosResponse<UserDto> | AxiosError>;
  removeRole: (
    userId: string,
    role: UserRole
  ) => Promise<AxiosResponse<UserDto> | AxiosError>;
};

export const useAdminUsers = (): useAdminUsersReturns => {
  const apiAuthClient = useApiAuthClient();
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  const patchRole = async (
    endpoint: 'addRole' | 'removeRole',
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<UserDto> | AxiosError> => {
    const response: AxiosResponse<UserDto> = await apiAuthClient.patch(
      `/admin/users/${userId}/${endpoint}`,
      {
        role,
      }
    );
    if (isResponseOk(response)) {
      const user = response.data;
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
  ): Promise<AxiosResponse<UserDto> | AxiosError> => {
    return patchRole('addRole', userId, role);
  };

  const removeRole = async (
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<UserDto> | AxiosError> => {
    return patchRole('removeRole', userId, role);
  };

  return { addRole, removeRole };
};
