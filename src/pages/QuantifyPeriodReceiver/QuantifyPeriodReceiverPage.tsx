import BreadCrumb from "@/components/BreadCrumb";
import { UserPseudonym } from "@/components/user/UserPseudonym";
import {
  PeriodActiveQuantifierReceiver,
  SinglePeriod,
  usePeriodPraiseQuery,
} from "@/model/periods";
import { SingleBooleanSetting } from "@/model/settings";
import BackLink from "@/navigation/BackLink";
import {
  faCalendarAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import QuantifyTable from "./components/QuantifyTable";

const PeriodBreadCrumb = () => {
  let { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  if (!period) return null;
  return <BreadCrumb name={`Quantify / ${period.name}`} icon={faCalendarAlt} />;
};

const DoneLabel = () => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

const PeriodMessage = () => {
  let { periodId, receiverId } = useParams() as any;
  usePeriodPraiseQuery(periodId);
  const data = useRecoilValue(
    PeriodActiveQuantifierReceiver({ periodId, receiverId })
  );
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting("PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS")
  );

  if (!data) return null;
  return (
    <>
      <h2>
        Receiver:{" "}
        {usePseudonyms ? (
          <UserPseudonym userId={receiverId} periodId={periodId} />
        ) : (
          data.receiverName
        )}
      </h2>
      <div>Number of praise items: {data.count}</div>
      <div>
        Items left to quantify:{" "}
        {data.count - data.done === 0 ? (
          <>
            0<DoneLabel />
          </>
        ) : (
          data.count - data.done
        )}
      </div>
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
