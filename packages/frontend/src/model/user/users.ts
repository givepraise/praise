import { AxiosError, AxiosResponse } from 'axios';
import {
  atom,
  selector,
  selectorFamily,
  useRecoilState,
  useRecoilCallback,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import React from 'react';
import { pseudonymNouns, psudonymAdjectives } from '@/utils/users';
import { useApiAuthClient } from '@/utils/api';
import { isResponseOk, ApiAuthGet } from '../api';
import { AllPeriods } from '../periods';
import { UserDto } from './dto/user.dto';
import { UserRole } from './enums/user-role.enum';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { isDateEqualOrAfter } from '@/utils/date';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instanceOfUser = (object: any): object is UserDto => {
  return 'identityEthAddress' in object;
};

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
            url: 'users?sortColumn=identityEthAddress&sortType=desc',
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
/**
 * User pseudonym for a given period.
 */
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

export type SingleUserParams = {
  userId: string;
};
/**
 * Selector that returns one individual User by id.
 */
export const SingleUser = selectorFamily({
  key: 'SingleUser',
  get:
    (userId: string | undefined) =>
    ({ get }): UserWithStatsDto | undefined => {
      const allUsers = get(AllUsers);
      if (!allUsers || !userId) return undefined;
      return allUsers.filter(
        (user) => user._id === userId
      )[0] as UserWithStatsDto;
    },
  set:
    (userId: string | undefined) =>
    ({ get, set }, user): void => {
      const allUsers = get(AllUsers);
      if (!userId || !user || !instanceOfUser(user) || !allUsers) return;
      if (allUsers.find((p) => p._id === user._id)) {
        // Update exisiting user
        set(
          AllUsers,
          allUsers.map((p) => (p._id === user._id ? user : p))
        );

        return;
      }

      // Add new user
      set(AllUsers, [...allUsers, user]);
    },
});

/**
 * Selector that returns one individual User by username.
 */
export const SingleUserByUsername = selectorFamily({
  key: 'SingleUserByUsername',
  get:
    (username: string | undefined) =>
    ({ get }): UserDto | undefined => {
      const allUsers = get(AllUsers);
      if (!allUsers || !username) return undefined;
      return allUsers.filter((user) => user.username === username)[0];
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

/**
 * Administer users. Add or remove roles.
 */
export const useAdminUsers = (): useAdminUsersReturns => {
  const apiAuthClient = useApiAuthClient();
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  const patchRole = async (
    endpoint: 'addRole' | 'removeRole',
    userId: string,
    role: UserRole
  ): Promise<AxiosResponse<UserDto> | AxiosError> => {
    const response: AxiosResponse<UserDto> = await apiAuthClient.patch(
      `/users/${userId}/${endpoint}`,
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

type useUserProfileReturn = {
  update: (
    userId: string,
    username: string,
    rewardsEthAddress: string
  ) => Promise<AxiosResponse<UserDto>>;
};
/**
 * Edit a user's profile.
 */
export const useUserProfile = (): useUserProfileReturn => {
  const apiAuthClient = useApiAuthClient();

  const update = useRecoilCallback(
    ({ set }) =>
      async (
        userId: string,
        username: string,
        rewardsEthAddress: string
      ): Promise<AxiosResponse<UserWithStatsDto>> => {
        const response: AxiosResponse<UserWithStatsDto> =
          await apiAuthClient.patch(`/users/${userId}`, {
            username,
            rewardsEthAddress,
          });

        if (isResponseOk(response)) {
          const user = response.data;
          set(SingleUser(user._id), user);
        }

        return response;
      }
  );

  return { update };
};

/**
 * Query that fetches the all details for a user, including praise stats
 */
const DetailedSingleUserQuery = selectorFamily({
  key: 'DetailedSingleUserQuery',
  get:
    (userId: string) =>
    ({ get }): AxiosResponse<UserWithStatsDto> | AxiosError => {
      return get(
        ApiAuthGet({
          url: `/users/${userId}`,
        })
      ) as AxiosResponse<UserWithStatsDto> | AxiosError;
    },
});

/**
 * Fetch all details for a user, including praise stats.
 * Update user cached in global state.
 */
export const useLoadSingleUserDetails = (
  userId: string
): AxiosResponse<UserWithStatsDto> | AxiosError => {
  const response = useRecoilValue(DetailedSingleUserQuery(userId));
  const user = useRecoilValue(SingleUser(userId));
  const setUser = useSetRecoilState(SingleUser(userId));

  React.useEffect(() => {
    if (!response || !user) return;
    if (isResponseOk(response)) {
      if (isDateEqualOrAfter(response.data.updatedAt, user.updatedAt)) {
        setUser(response.data);
      }
    }
  }, [response, user, setUser]);

  return response;
};
