import { ActivePeriodMessage } from "@/components/periods/ActivePeriodMessage";
import { ActiveUserQuantificationsMessage } from "@/components/periods/ActiveUserQuantificationsMessage";
import PraisesTable from "@/components/praise/Table";
import React from "react";

const MainPage = () => {
  return (
    <>
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

export default MainPage;
