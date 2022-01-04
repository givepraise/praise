import {
  ActiveUserQuantifications,
  QuantifierData,
  SinglePeriod,
} from "@/model/periods";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";

interface QuantifierPeriodMessageProps {
  quantifierData: QuantifierData;
}
const QuantifierPeriodMessage = ({
  quantifierData,
}: QuantifierPeriodMessageProps) => {
  const period = useRecoilValue(
    SinglePeriod({ periodId: quantifierData.periodId })
  );

  if (!period) return null;
  return (
    <li key={period._id}>
      <Link to="/">{period.name}</Link> (
      {quantifierData.count - quantifierData.done}/{quantifierData.count}{" "}
      unfinished items)
    </li>
  );
};

export const ActiveUserQuantificationsMessage = () => {
  const activeUserQuantifications = useRecoilValue(ActiveUserQuantifications);
  if (
    !activeUserQuantifications ||
    !Array.isArray(activeUserQuantifications) ||
    activeUserQuantifications.length === 0
  )
    return null;

  return (
    <div className="mt-2">
      You can perform quantifications for the following periods:
      <ul className="list-disc list-inside">
        {activeUserQuantifications.map((qp) => (
          <QuantifierPeriodMessage quantifierData={qp} key={qp.periodId} />
        ))}
      </ul>
    </div>
  );
};
