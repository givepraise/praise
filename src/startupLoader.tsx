import { HasRole } from "@/model/auth";
import {
  AllPeriods,
  useAllPeriodsQuery,
  usePeriodPraisesQuery,
} from "@/model/periods";
import { useAllUsersQuery } from "@/model/users";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useRecoilValue } from "recoil";

interface QuantifyPeriodLoaderProps {
  periodId: string;
}

const QuantifyPeriodLoader = ({ periodId }: QuantifyPeriodLoaderProps) => {
  usePeriodPraisesQuery(periodId);
  return null;
};

export const StartupLoader = () => {
  useAllPeriodsQuery();
  useAllUsersQuery();
  const periods = useRecoilValue(AllPeriods);

  const isQuantifier = useRecoilValue(HasRole("QUANTIFIER"));

  if (!periods) return null;

  if (isQuantifier) {
    return (
      <>
        {periods.map((period) =>
          period._id && period.status === "QUANTIFY" ? (
            <QuantifyPeriodLoader periodId={period._id} key={period._id} />
          ) : null
        )}
      </>
    );
  }

  return null;
};

export const LoadScreen = () => {
  return (
    <div className="fixed top-0 left-0 z-50 block w-full h-full bg-white opacity-75">
      <span
        className="relative block w-0 h-0 mx-auto my-0 text-green-500 opacity-75 top-1/2"
        style={{ top: "50%" }}
      >
        <FontAwesomeIcon icon={faCalculator} size="3x" spin />
      </span>
    </div>
  );
};
