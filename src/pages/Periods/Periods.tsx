import BreadCrumb from "@/components/BreadCrumb";
import PeriodsTable from "@/components/periods/Table";
import { AllPeriodsQuery } from "@/store/periods";
import { formatDate } from "@/utils/date";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { compareDesc } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";

const ActivePeriodMessage = () => {
  const allPeriods = useRecoilValue(AllPeriodsQuery({}));
  const latestPeriod = allPeriods[0];
  const exists = compareDesc(new Date(), new Date(latestPeriod.endDate)) >= 0;

  if (!exists) return <div>There is no active quantification period.</div>;

  return (
    <div>
      Current quantification period ends at {formatDate(latestPeriod.endDate)}
    </div>
  );
};

const PeriodsPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <div className="mb-2 text-right">
          <Link to="/periods/createupdate">
            <button className="praise-button">Create period</button>
          </Link>
        </div>
        <React.Suspense fallback="Loading…">
          <PeriodsTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodsPage;
