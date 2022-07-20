import { UserDto, UserRole } from 'api/dist/user/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { pseudonymNouns, psudonymAdjectives } from '@/utils/users';
import {
  ApiAuthGet,
  ApiAuthPatch,
  ApiQuery,
  isResponseOk,
  useAuthApiQuery,
} from './api';
import { ActiveTokenSet } from './auth';
import { AllPeriods } from './periods';

interface roleOptionsProps {
  value: string;
  label: string;
}

const roleOptions = [
  { label: 'All users', value: UserRole.USER },
  { label: 'Admins', value: UserRole.ADMIN },
  { label: 'Forwarders', value: UserRole.FORWARDER },
  { label: 'Quantifiers', value: UserRole.QUANTIFIER },
];

const AllUsersQuery = selector({
  key: 'AllUsersQuery',
  get: ({ get }) => {
    const activeTokenSet = get(ActiveTokenSet);
    if (!activeTokenSet) throw Error('Not authenticated');

    return get(
      ApiAuthGet({
        url: 'users/all?sortColumn=ethereumAddress&sortType=desc',
      })
    );
  },
});

export const AllUsers = atom<UserDto[] | undefined>({
  key: 'AllUsers',
  default: undefined,
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

export const useAllUsersQuery = (): AxiosResponse<unknown> => {
  const allUsersQueryResponse = useAuthApiQuery(AllUsersQuery);
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  React.useEffect(() => {
    if (
      isResponseOk(allUsersQueryResponse) &&
      typeof allUsers === 'undefined'
    ) {
      const users = allUsersQueryResponse.data as UserDto[];
      if (Array.isArray(users) && users.length > 0) setAllUsers(users);
    }
  }, [allUsersQueryResponse, setAllUsers, allUsers]);

  return allUsersQueryResponse;
};

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

const AddUserRoleApiResponse = atom<
  AxiosResponse<unknown> | AxiosError<unknown> | null
>({
  key: 'AddUserRoleApiResponse',
  default: null,
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
// Hook that returns functions for administering users
export const useAdminUsers = (): useAdminUsersReturns => {
  const allUsers: UserDto[] | undefined = useRecoilValue(AllUsers);

  const addRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/admin/users/${userId}/addRole`,
              data: { role },
            })
          )
        );

        // If OK response, add returned user object to local state
        if (isResponseOk(response)) {
          const user = response.data as UserDto;
          if (user) {
            if (typeof allUsers !== 'undefined') {
              set(
                AllUsers,
                allUsers.map((oldUser) =>
                  oldUser._id === user._id ? user : oldUser
                )
              );
            } else {
              set(AllUsers, [user]);
            }
          }
          set(AddUserRoleApiResponse, response);
        }
        return response;
      }
  );

  const removeRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await ApiQuery(
          snapshot.getPromise(
            ApiAuthPatch({
              url: `/admin/users/${userId}/removeRole`,
              data: { role },
            })
          )
        );

        // If OK response, add returned user object to local state
        if (isResponseOk(response)) {
          const user = response.data as UserDto;
          if (user) {
            if (typeof allUsers !== 'undefined') {
              set(
                AllUsers,
                allUsers.map((oldUser) =>
                  oldUser._id === user._id ? user : oldUser
                )
              );
            } else {
              set(AllUsers, [user]);
            }
          }
          set(AddUserRoleApiResponse, response);
        }
        return response;
      }
  );

  return { addRole, removeRole };
};
