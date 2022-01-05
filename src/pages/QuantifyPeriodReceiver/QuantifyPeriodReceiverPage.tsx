import BreadCrumb from "@/components/BreadCrumb";
import {
  PeriodActiveQuantifierReceiver,
  SinglePeriod,
  useAllPeriodsQuery,
} from "@/model/periods";
import BackLink from "@/navigation/BackLink";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import QuantifyTable from "./components/Table";

const PeriodBreadCrumb = () => {
  let { periodId } = useParams() as any;

  useAllPeriodsQuery(); // Make sure that all periods are fetched
  const period = useRecoilValue(SinglePeriod({ periodId }));

  if (!period) return null;
  return <BreadCrumb name={`Quantify / ${period.name}`} icon={faCalendarAlt} />;
};

const PeriodMessage = () => {
  let { periodId, receiverId } = useParams() as any;

  const data = useRecoilValue(
    PeriodActiveQuantifierReceiver({ periodId, receiverId })
  );

  if (!data) return null;
  return (
    <>
      <h2>Receiver: {data.receiverName}</h2>
      <p>Number of praise items: {data.count}</p>
      <p>Items left to quantify: {data.count - data.done}</p>
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
