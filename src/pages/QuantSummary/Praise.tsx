import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import PraiseDetailTable from "@/components/QuantSummary/PraiseDetailTable";
import { SinglePeriod } from "@/model/periods";
import { SinglePraise } from "@/model/praise";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodReceiverBreadCrumb = () => {
  let { periodId, praiseId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const praise = useRecoilValue(SinglePraise({ praiseId }));

  if (!praise || !period) return null;
  return (
    <BreadCrumb
      name={`Quantification Praise Details / ${praise._id}`}
      icon={faCalendarAlt}
    />
  );
};

const PeriodReceiverMessage = () => {
  let { periodId, praiseId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const praise = useRecoilValue(SinglePraise({ praiseId }));

  if (!period || !praise) return null;
  return (
    <>
      <h2>Quantification Praise Details</h2>
      <div className="mt-5">
        Giver: {praise.giver.username}
        <br />
        Receiver: {praise.receiver.username}
        <br />
        Average praise score: {praise.avgScore}
      </div>
      <div className="mt-2">Reason: {praise.reason}</div>
    </>
  );
};

const QuantSummaryPraisePage = () => {
  return (
    <>
      <React.Suspense fallback="Loading…">
        <PeriodReceiverBreadCrumb />
      </React.Suspense>

      <BackLink />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseDetailTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantSummaryPraisePage;
