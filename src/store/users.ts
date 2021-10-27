import React from "react";
import { atom, selector, useRecoilState } from "recoil";
import { ApiAuthGetQuery, isApiResponseOk, useAuthApiQuery } from "./api";

enum USER_ROLE {
  Admin = "ROLE_ADMIN",
  Quantifier = "ROLE_QUANTIFIER",
  User = "ROLE_USER",
}

export interface User {
  id: number;
  ethereumAddress: string;
  roles: string[];
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
    return get(ApiAuthGetQuery({ endPoint: "/api/admin/users/all" }));
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
      return users.filter((user) => user.roles.includes(USER_ROLE.Quantifier));
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
      const users = allUsersQueryResponse.data as User[];
      if (Array.isArray(users) && users.length > 0) setAllUsers(users);
    }
  }, [allUsersQueryResponse, setAllUsers, allUsers]);

  return allUsersQueryResponse;
};
