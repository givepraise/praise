import { AllUsersQuery } from "@/store/index";
import React from "react";
import { useRecoilValue } from "recoil";

export default function AllUsers() {
  const AllUsersInner = () => {
    const allUsers = useRecoilValue(AllUsersQuery({}));

    if (!allUsers) return <div>Unable to fetch user list.</div>;
    return <div>{JSON.stringify(allUsers)}</div>;
  };

  return (
    <React.Suspense fallback={null}>
      <AllUsersInner />
    </React.Suspense>
  );
}
