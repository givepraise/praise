import { AllUsersQuery } from "@/store/admin";
import { useAuthApiQuery } from "@/store/api";
import React from "react";

export default function AllUsers() {
  const AllUsersInner = () => {
    // Always use `useAuthApiQuery` for queries instead of `useRecoilValue`
    // to correctly handle expired JWT tokens and other error codes returned by
    // the server
    const allUsers = useAuthApiQuery(AllUsersQuery({}));

    if (!allUsers?.data) return <div>Unable to fetch user list.</div>;
    return <div>{JSON.stringify(allUsers.data)}</div>;
  };

  return (
    <React.Suspense fallback={null}>
      <AllUsersInner />
    </React.Suspense>
  );
}
