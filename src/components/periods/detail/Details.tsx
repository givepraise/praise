import {
  AllPeriods,
  SinglePeriod,
  useAllPeriodsQuery,
} from "@/model/periods";
import { formatDate } from "@/utils/date";
import { getPreviousPeriod } from "@/utils/periods";

import "react-day-picker/lib/style.css";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

const PeriodDetails = () => {
    // Make sure that all periods are fetched
    useAllPeriodsQuery();
    const allPeriods = useRecoilValue(AllPeriods);
    let { id } = useParams() as any;
    const period = useRecoilValue(SinglePeriod({ id: id }));
  
    if (!period || !allPeriods) return null;
  
    const periodStartDate = getPreviousPeriod(allPeriods, period);
    const periodStart = periodStartDate
      ? formatDate(periodStartDate.endDate)
      : "Dawn of time";
  
    return (
      <div>
        <div>Period start: {periodStart}</div>
        <div>Period end: {formatDate(period.endDate)}</div>
      </div>
    );
  };

  export default PeriodDetails;