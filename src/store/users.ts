import React from "react";
import { atom, selector, useSetRecoilState } from "recoil";
import {
  ApiAuthGetQuery,
  getApiResponseOkData,
  useAuthRecoilValue,
} from "./api";

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

export const AllUsers = atom({
  key: "AllUsers",
  default: [] as User[],
});

export const AllQuantifierUsers = selector({
  key: "AllQuantifierUsers",
  get: async ({ get }) => {
    const users = get(AllUsers);
    return users.filter((user) => user.roles.includes(USER_ROLE.Quantifier));
  },
});

export const useAllUsersQuery = () => {
  const allUsersQueryResponse = useAuthRecoilValue(AllUsersQuery);
  const setAllUsers = useSetRecoilState(AllUsers);

  React.useEffect(() => {
    const users = getApiResponseOkData(allUsersQueryResponse) as User[];
    if (Array.isArray(users) && users.length > 0) setAllUsers(users);
  }, [allUsersQueryResponse, setAllUsers]);

  return allUsersQueryResponse;
};
