import {
  AllPeriods,
  SinglePeriod,
  useAllPeriodsQuery,
} from "@/model/periods";
import { formatDate } from "@/utils/date";
import { getPreviousPeriod } from "@/utils/periods";
import { Dialog } from "@headlessui/react";
import React from "react";

import "react-day-picker/lib/style.css";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import PeriodAssignDialog from "../AssignDialog";
import PeriodCloseDialog from "../CloseDialog";
import PeriodDateForm from "./PeriodDateForm";

const PeriodDetails = () => {
    let [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
    let [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

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

    const handleClosePeriod = () => {
      console.log('close period!!!')
    }

    const handleAssign = () => {
      console.log('Assign!')
    }
  
    return (
      <div>
        <div>Period start: {periodStart}</div>
        {/* <div>Period end: {formatDate(period.endDate)}</div> */}
        <div className="flex mt-4">
          <div className="inline">Period end:</div>
          <div className="inline ml-3 mt-[-9px]"><PeriodDateForm></PeriodDateForm></div>
        </div>

        <div className="mt-5">
          <button className="praise-button text-xs" onClick={() => setIsAssignDialogOpen(true)}>
            Assign quantifiers
          </button>
          <button className="praise-button ml-5 text-xs" onClick={() => setIsCloseDialogOpen(true)} >
            Close period
          </button>
        </div>

        <React.Suspense fallback={null}>
          <Dialog
            open={isCloseDialogOpen}
            onClose={() => setIsCloseDialogOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <PeriodCloseDialog
              onClose={() => setIsCloseDialogOpen(false)}
              onRemove={() => handleClosePeriod()}
            />
          </Dialog>
        </React.Suspense>

        <React.Suspense fallback={null}>
          <Dialog
            open={isAssignDialogOpen}
            onClose={() => setIsAssignDialogOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <PeriodAssignDialog
              onClose={() => setIsAssignDialogOpen(false)}
              onAssign={() => handleAssign()}
            />
          </Dialog>
        </React.Suspense>
      </div>
    );
  };

  export default PeriodDetails;