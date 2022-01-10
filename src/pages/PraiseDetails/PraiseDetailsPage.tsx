import BreadCrumb from "@/components/BreadCrumb";
import { HasRole, ROLE_ADMIN } from "@/model/auth";
import { SinglePeriodByDate } from "@/model/periods";
import { SinglePraiseExt, useSinglePraiseQuery } from "@/model/praise";
import BackLink from "@/navigation/BackLink";
import { formatDateLong } from "@/utils/date";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import PraiseDetailTable from "./components/PraiseDetailTable";

const PeriodReceiverMessage = () => {
  let { praiseId } = useParams() as any;
  useSinglePraiseQuery(praiseId);
  const praise = useRecoilValue(SinglePraiseExt(praiseId));
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise || !period) return null;

  return (
    <>
      Praise Id: {praise._id}
      <br />
      Date: {formatDateLong(praise.createdAt)}
      <br />
      Giver: {praise.giver.username}
      <br />
      Receiver: {praise.receiver.username}
      {period.status === "CLOSED" || isAdmin ? (
        <>
          <br />
          Average praise score: {praise.avgScore}
        </>
      ) : null}
      <div className="mt-2">Reason: {praise.reason}</div>
    </>
  );
};

const QuantSummaryPraisePage = () => {
  return (
    <>
      <BreadCrumb name={`Praise details`} icon={faCalendarAlt} />
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
