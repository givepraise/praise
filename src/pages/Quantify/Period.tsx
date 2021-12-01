import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import QuantifyOverviewTable from "@/components/QuantifyPeriod/Table";
import { SinglePeriod, useAllPeriodsQuery } from "@/model/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodMessage = () => {
  let { periodId } = useParams() as any;

  useAllPeriodsQuery(); // Make sure that all periods are fetched
  const period = useRecoilValue(SinglePeriod({ id: periodId }));

  return (
    <>
      <h2>{period?.name}</h2>
      <div>
        Assigned number of praise items: 27 <br />
        Items left to quantify this period: 17
      </div>
    </>
  );
};

const QuantifyPeriodPage = () => {
  return (
    <>
      <BreadCrumb name="Quantify" icon={faCalendarAlt} />
      <BackLink />
      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodMessage />
        </React.Suspense>
      </div>

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <QuantifyOverviewTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantifyPeriodPage;
