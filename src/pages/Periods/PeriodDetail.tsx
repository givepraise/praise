import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import { Period, useAllPeriodsQuery } from "@/store/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import QuantPeriodOverview from "./QuantPeriodOverview";
import { formatDate } from "@/utils/date";


const PeriodDetailPage = () => {
  const { data } = useAllPeriodsQuery();

  let { id } = useParams() as { id: string };
  var intId: number = parseInt(id);

  const thisPeriod = data.filter((period: Period) => period.id === intId);
  const lastPeriod = data.filter((period: Period) => period.id === intId - 1);

  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <QuantPeriodOverview 
            periodId = {thisPeriod[0].id}
            periodName = {thisPeriod[0].name}
            periodStart = { lastPeriod[0] ? formatDate(lastPeriod[0].endDate) : "-" }
            periodEnd = { formatDate(thisPeriod[0].endDate) }
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

export default PeriodDetailPage;
