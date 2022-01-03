import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import {
  ApiAuthGetQuery,
  ApiAuthPatchQuery,
  isApiErrorData,
  isApiResponseOk,
  PaginatedResponseData,
  useAuthApiQuery,
} from "./api";

export enum UserRole {
  ADMIN = "ADMIN",
  QUANTIFIER = "QUANTIFIER",
  USER = "USER",
}

export interface User {
  _id: string;
  createdAt: string;
  updatedAt: string;
  ethereumAddress: string;
  accounts?: UserAccount[];
  roles: UserRole[];
}

export enum UserAccountPlatform {
  DISCORD = "DISCORD",
  TELEGRAM = "TELEGRAM",
}

export interface UserAccount {
  id: string;
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
}

// The request Id is used to force refresh of AllUsersQuery.
// AllUsersQuery subscribes to the value. Increase to trigger
// refresh.
const UsersRequestId = atom({
  key: "UsersRequestId",
  default: 0,
});

export const AllUsersQuery = selector({
  key: "AllUsersQuery",
  get: async ({ get }) => {
    get(UsersRequestId);
    return get(
      ApiAuthGetQuery({
        endPoint:
          "/api/admin/users/all?sortColumn=ethereumAddress&sortType=desc",
      })
    );
  },
});

export const AllUsers = atom<User[] | undefined>({
  key: "AllUsers",
  default: undefined,
});

export const AllQuantifierUsers = selector({
  key: "AllQuantifierUsers",
  get: async ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) => user.roles.includes(UserRole.QUANTIFIER));
    }
    return undefined;
  },
});

export const useAllUsersQuery = () => {
  const allUsersQueryResponse = useAuthApiQuery(AllUsersQuery);
  const [allUsers, setAllUsers] = useRecoilState(AllUsers);

  React.useEffect(() => {
    if (
      isApiResponseOk(allUsersQueryResponse) &&
      typeof allUsers === "undefined"
    ) {
      const paginatedResponse =
        allUsersQueryResponse.data as PaginatedResponseData;
      const users = paginatedResponse.docs as User[];
      if (Array.isArray(users) && users.length > 0) setAllUsers(users);
    }
  }, [allUsersQueryResponse, setAllUsers, allUsers]);

  return allUsersQueryResponse;
};

export const SingleUser = selectorFamily({
  key: "SingleUser",
  get:
    (params: any) =>
    async ({ get }) => {
      const { userId } = params;
      const allUsers = get(AllUsers);
      if (!allUsers) return null;
      return allUsers.filter((user) => user._id === userId)[0];
    },
});

export const AddUserRoleApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "AddUserRoleApiResponse",
  default: null,
});

// Hook that returns functions for administering users
export const useAdminUsers = () => {
  const allUsers: User[] | undefined = useRecoilValue(AllUsers);

  const addRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await snapshot.getPromise(
          ApiAuthPatchQuery({
            endPoint: `/api/admin/users/${userId}/addRole`,
            data: { role },
          })
        );

        // If OK response, add returned user object to local state
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const user = response.data as User;
          if (user) {
            if (typeof allUsers !== "undefined") {
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
        }
        set(AddUserRoleApiResponse, response);
        return response;
      }
  );

  const removeRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: string, role: UserRole) => {
        const response = await snapshot.getPromise(
          ApiAuthPatchQuery({
            endPoint: `/api/admin/users/${userId}/removeRole`,
            data: { role },
          })
        );

        // If OK response, add returned user object to local state
        if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
          const user = response.data as User;
          if (user) {
            if (typeof allUsers !== "undefined") {
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
        }
        set(AddUserRoleApiResponse, response);
        return response;
      }
  );

  return { addRole, removeRole };
};
