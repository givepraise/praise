import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import { SinglePeriod, useAllPeriodsQuery } from "@/store/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodDetails = () => {
  // Make sure that all periods are fetched
  useAllPeriodsQuery();
  let { id } = useParams() as any;

  const period = useRecoilValue(SinglePeriod({ id: id }));

  return <div>{JSON.stringify(period)}</div>;
};

const PeriodDetailPage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodDetails />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodDetailPage;
