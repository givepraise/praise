import BreadCrumb from "@/components/BreadCrumb";
import { ActivePeriodMessage } from "@/components/periods/ActivePeriodMessage";
import { ActiveUserQuantificationsMessage } from "@/components/periods/ActiveUserQuantificationsMessage";
import PraisesTable from "@/pages/Start/components/Table";
import { faPrayingHands } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const StartPage = () => {
  return (
    <>
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
          <ActiveUserQuantificationsMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <PraisesTable />
      </div>
    </>
  );
};

export default StartPage;
