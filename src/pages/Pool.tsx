import BreadCrumb from "@/components/BreadCrumb";
import PoolTable from "@/components/pool/Table";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const PoolPage = () => {
  return (
    <>
      <BreadCrumb name="Quantifier pool" icon={faUserFriends} />

      <div className="praise-box">
        <div className="mb-2 text-right">
          <button className="praise-button">Add quantifier</button>
        </div>

        <React.Suspense fallback={null}>
          <PoolTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PoolPage;
