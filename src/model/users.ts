import { AxiosError, AxiosResponse } from "axios";
import React from "react";
import {
  atom,
  selector,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import { ApiAuthGetQuery, isApiResponseOk, useAuthApiQuery } from "./api";

export enum USER_INDENTITY_ROLE {
  Admin = "ROLE_ADMIN",
  Quantifier = "ROLE_QUANTIFIER",
  User = "ROLE_USER",
}

export interface UserIdentity {
  id: number;
  createdAt: string;
  updatedAt: string;
  ethereumAddress: string;
  roles: USER_INDENTITY_ROLE[];
  accounts?: UserAccount[];
}

export enum USER_ACCOUNT_PLATFORM {
  Discord = "DISCORD",
  Telegram = "TELEGRAM",
}

export interface UserAccount {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId?: UserIdentity;
  accountId: string;
  userName: string;
  profileImageUrl: string;
  platform: USER_ACCOUNT_PLATFORM;
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
    return get(ApiAuthGetQuery({ endPoint: "/api/admin/users/allByFilter" }));
  },
});

export const AllUsers = atom<UserIdentity[] | undefined>({
  key: "AllUsers",
  default: undefined,
});

export const AllQuantifierUsers = selector({
  key: "AllQuantifierUsers",
  get: async ({ get }) => {
    const users = get(AllUsers);
    if (users) {
      return users.filter((user) =>
        user.roles.includes(USER_INDENTITY_ROLE.Quantifier)
      );
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
      const users = (allUsersQueryResponse.data as any)
        .content as UserIdentity[];
      if (Array.isArray(users) && users.length > 0) setAllUsers(users);
    }
  }, [allUsersQueryResponse, setAllUsers, allUsers]);

  return allUsersQueryResponse;
};

export const AddUserRoleApiResponse = atom<
  AxiosResponse<never> | AxiosError<never> | null
>({
  key: "AddUserRoleApiResponse",
  default: null,
});

// Hook that returns functions for administering users
export const useAdminUsers = () => {
  const allUsers: UserIdentity[] | undefined = useRecoilValue(AllUsers);

  const addRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: number, role: USER_INDENTITY_ROLE) => {
        // const response = await snapshot.getPromise(
        //   ApiAuthPatchQuery({
        //     endPoint: `/api/admin/users/${user.id}/addRole...`,
        //     data: ... ,
        //   })
        // );

        // mock adding of role, remove when endpoint is finished
        if (user.roles?.indexOf(role) === -1) {
          user.roles.push(role);
        }

        // If OK response, add returned user object to local state
        //if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
        //const user = response.data as UserIdentity;
        if (user) {
          if (typeof allUsers !== "undefined") {
            set(
              AllUsers,
              allUsers.map((oldUser) =>
                oldUser.id === user.id ? user : oldUser
              )
            );
          } else {
            set(AllUsers, [user]);
          }
        }
        // }
        // set(AddUserRoleApiResponse, response);
        // return response;
      }
  );

  const removeRole = useRecoilCallback(
    ({ snapshot, set }) =>
      async (userId: number, role: USER_INDENTITY_ROLE) => {
        // const response = await snapshot.getPromise(
        //   ApiAuthPatchQuery({
        //     endPoint: `/api/admin/users/${user.id}/removeRole...`,
        //     data: ... ,
        //   })
        // );

        // mock removing of role, remove when endpoint is finished
        const index = user.roles?.indexOf(role);
        if (index > -1) {
          user.roles.splice(index, 1);
        }

        // If OK response, add returned user object to local state
        //if (isApiResponseOk(response) && !isApiErrorData(response.data)) {
        //const user = response.data as UserIdentity;
        if (user) {
          if (typeof allUsers !== "undefined") {
            set(
              AllUsers,
              allUsers.map((oldUser) =>
                oldUser.id === user.id ? user : oldUser
              )
            );
          } else {
            set(AllUsers, [user]);
          }
        }
        // }
        // set(AddUserRoleApiResponse, response);
        // return response;
      }
  );

  return { addRole, removeRole };
};
