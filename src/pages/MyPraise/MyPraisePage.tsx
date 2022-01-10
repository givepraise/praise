import BreadCrumb from "@/components/BreadCrumb";
import { ActivePeriodMessage } from "@/components/periods/ActivePeriodMessage";
import { ActiveUserQuantificationsMessage } from "@/components/periods/ActiveUserQuantificationsMessage";
import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PraiseTable from "./components/MyPraiseTable";

const MyPraise = () => {
  return (
    <>
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
          <ActiveUserQuantificationsMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default MyPraise;
