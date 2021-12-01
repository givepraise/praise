import AdminOnly from "@/components/auth/AdminOnly";
import BreadCrumb from "@/components/BreadCrumb";
import PeriodsTable from "@/components/periods/Table";
import { AllPeriods, useAllPeriodsQuery } from "@/model/periods";
import { formatDate } from "@/utils/date";
import { getActivePeriod } from "@/utils/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";

const ActivePeriodMessage = () => {
  useAllPeriodsQuery();
  const allPeriods = useRecoilValue(AllPeriods);

  const noPeriodMessage = "There is no active quantification period.";

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>{noPeriodMessage}</div>;

  const activePeriod = getActivePeriod(allPeriods);
  if (!activePeriod) return <div>{noPeriodMessage}</div>;

  return (
    <div>
      Current quantification period ends at: {formatDate(activePeriod.endDate)}
    </div>
  );
};

const PeriodsPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
        </React.Suspense>

        <div className="mt-2">
          You can perform quantifications for the following periods:
          <ul className="ml-5 list-disc">
            <li>
              <Link to="/quantify/period/1">Aug-Sep</Link> (17/27 unfinished
              items)
            </li>
            <li>Jun-Jul</li>
          </ul>
        </div>
      </div>

      <div className="w-2/3 praise-box">
        <AdminOnly>
          <div className="mb-2 text-right">
            <Link to="/periods/createupdate">
              <button className="praise-button" id="create-period-button">
                Create period
              </button>
            </Link>
          </div>
        </AdminOnly>
        <React.Suspense fallback="Loading…">
          <PeriodsTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodsPage;
