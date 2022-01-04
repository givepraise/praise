import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import PeriodDetails from "@/components/periods/detail/Details";
import PeriodNameForm from "@/components/periods/detail/PeriodNameForm";
import QuantifierTable from "@/components/periods/detail/QuantifierTable";
import ReceiverTable from "@/components/periods/detail/ReceiverTable";
import { SinglePeriod, useAllPeriodsQuery } from "@/model/periods";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { default as React } from "react";
import "react-day-picker/lib/style.css";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodDetailPage = () => {
  useAllPeriodsQuery();
  let { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));

  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <div className="w-2/3 praise-box ">
        <React.Suspense fallback="Loading…">
          <div className="float-right px-2 py-1 text-xs text-white bg-black rounded-full">
            {period ? period.status : null}
          </div>
          <PeriodNameForm />
          <PeriodDetails />
        </React.Suspense>
      </div>
      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          {period?.status === "QUANTIFY" || period?.status === "CLOSED" ? (
            <QuantifierTable />
          ) : (
            "No quantifiers have yet been assigned to this period."
          )}
        </React.Suspense>
      </div>
      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ReceiverTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodDetailPage;
