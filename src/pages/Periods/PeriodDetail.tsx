import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import { Period, SinglePeriod, useAllPeriodsQuery } from "@/store/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import QuantPeriodOverview from "./QuantPeriodOverview";
import { formatDate } from "@/utils/date";


const PeriodDetail = () => {
  useAllPeriodsQuery();
  let { id } = useParams() as any;

  const thisPeriod = useRecoilValue(SinglePeriod({ id: id }));
  
  const lastPeriod = useRecoilValue(SinglePeriod({ id: id - 1 }));

  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <QuantPeriodOverview 
            periodId = {thisPeriod[0].id}
            periodName = {thisPeriod[0].name}
            periodStart = {formatDate(lastPeriod[0].endDate)}
            periodEnd = {formatDate(thisPeriod[0].endDate)}
          />
        </React.Suspense>
      </div>
      <div className="praise-box">
        <React.Suspense fallback="Loading…">
        </React.Suspense>
      </div>
      <div className="praise-box">
        <React.Suspense fallback="Loading…">
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodDetail;
