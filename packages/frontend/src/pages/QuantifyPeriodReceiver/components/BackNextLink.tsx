import { UserPseudonym } from "@/components/user/UserPseudonym";
import { PeriodActiveQuantifierReceivers } from "@/model/periods";
import { SingleBooleanSetting } from "@/model/settings";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

export const QuantifyBackNextLink = () => {
  let { periodId, receiverId } = useParams() as any;

  const receivers = useRecoilValue(
    PeriodActiveQuantifierReceivers({ periodId })
  );
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting("PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS")
  );

  let backReceiver, forwardReceiver;

  if (!receivers) return null;
  const i = receivers.findIndex((r) => r.receiverId === receiverId);

  if (i > 0) {
    backReceiver = receivers[i - 1];
  }

  if (i < receivers.length - 1) {
    forwardReceiver = receivers[i + 1];
  }

  return (
    <div className="grid grid-cols-2 mt-5">
      <div className="text-left">
        {backReceiver && (
          <Link
            replace
            to={`/quantify/period/${periodId}/receiver/${backReceiver.receiverId}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} size="1x" className="mr-2" />
            {usePseudonyms ? (
              <UserPseudonym
                userId={backReceiver.receiverId}
                periodId={periodId}
              />
            ) : (
              backReceiver.receiverName
            )}
          </Link>
        )}
      </div>
      <div className="text-right">
        {forwardReceiver && (
          <Link
            replace
            to={`/quantify/period/${periodId}/receiver/${forwardReceiver.receiverId}`}
          >
            {usePseudonyms ? (
              <UserPseudonym
                userId={forwardReceiver.receiverId}
                periodId={periodId}
              />
            ) : (
              forwardReceiver.receiverName
            )}
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
};
