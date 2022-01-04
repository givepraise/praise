import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import PeriodReceiverTable from "@/components/QuantSummary/Table";
import { PeriodReceiver, SinglePeriod } from "@/model/periods";
import { SingleUserByReceiverId } from "@/model/users";
import { getUsername } from "@/utils/users";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodReceiverBreadCrumb = () => {
  let { periodId, receiverId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));

  if (!user || !period) return null;
  return (
    <BreadCrumb
      name={`Quantification Summary / ${period?.name} / ${getUsername(user)}`}
      icon={faCalendarAlt}
    />
  );
};

const PeriodReceiverMessage = () => {
  let { periodId, receiverId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
  const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));
  if (!user || !period || !receiverData) return null;
  return (
    <>
      <h2>Quantification period summary</h2>
      <div className="mt-5">
        Receiver: {getUsername(user)}
        <br />
        Period: {period.name}
        <br />
        Total praise score: {receiverData.praiseScore}
      </div>
    </>
  );
};

const QuantSummaryPeriodReceiverPage = () => {
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
          <PeriodReceiverTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantSummaryPeriodReceiverPage;
