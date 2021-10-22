import { AllUsersQuery } from "@/store/admin";
import { useAuthRecoilValue } from "@/store/api";
import React from "react";

export default function AllUsers() {
  const AllUsersInner = () => {
    const allUsers = useAuthRecoilValue(AllUsersQuery({}));

    if (!allUsers?.data) return <div>Unable to fetch user list.</div>;
    return <div>{JSON.stringify(allUsers.data)}</div>;
  };

  return (
    <React.Suspense fallback={null}>
      <AllUsersInner />
    </React.Suspense>
  );
}
