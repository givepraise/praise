import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import QuantifyTable from "@/components/QuantifyPeriodUser/Table";
import { SinglePeriod, useAllPeriodsQuery } from "@/model/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodBreadCrumb = () => {
  let { periodId } = useParams() as any;

  useAllPeriodsQuery(); // Make sure that all periods are fetched
  const period = useRecoilValue(SinglePeriod({ periodId }));

  if (!period) return null;
  return <BreadCrumb name={`Quantify / ${period.name}`} icon={faCalendarAlt} />;
};

const PeriodMessage = () => {
  return (
    <>
      <h2>Receiver: Happy Salamander</h2>
      <p>Number of praise items: 17</p>
      <p>Items left to quantify: 17</p>
    </>
  );
};

const QuantifyPeriodUserPage = () => {
  return (
    <>
      <React.Suspense fallback="Loading…">
        <PeriodBreadCrumb />
      </React.Suspense>
      <BackLink />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodMessage />
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

export default QuantifyPeriodUserPage;
