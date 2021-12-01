import BreadCrumb from "@/components/BreadCrumb";
import QuantifyTable from "@/components/quantify/Table";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const QuantifyPage = () => {    

  return (
    <>
      <BreadCrumb name="Quantify" icon={faUserFriends} />

      <div className="praise-box w-2/3">
        <React.Suspense fallback="Loading…">
          <p className="font-semibold text-lg mb-1.5">Receiver: Happy Salamander</p>
          <p>Number of praise items: 17</p>
          <p>Items left to quantify: 17</p>
        </React.Suspense>
      </div>

      <div className="praise-box">        
        <React.Suspense fallback={null}>          
          <QuantifyTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantifyPage;
