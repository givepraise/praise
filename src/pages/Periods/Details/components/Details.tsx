import { HasRole, ROLE_ADMIN } from "@/model/auth";
import {
  AllPeriods,
  SinglePeriod,
  useAssignQuantifiers,
  useClosePeriod,
} from "@/model/periods";
import { formatDate } from "@/utils/date";
import { getPreviousPeriod } from "@/utils/periods";
import { Dialog } from "@headlessui/react";
import React from "react";
import "react-day-picker/lib/style.css";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import PeriodAssignDialog from "./AssignDialog";
import PeriodCloseDialog from "./CloseDialog";
import PeriodDateForm from "./PeriodDateForm";

const PeriodDetails = () => {
  let [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  let [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  let { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  const assignDialogRef = React.useRef(null);
  const closeDialogRef = React.useRef(null);

  const { closePeriod } = useClosePeriod();
  const { assignQuantifiers } = useAssignQuantifiers();

  if (!period || !allPeriods) return null;

  const periodStartDate = getPreviousPeriod(allPeriods, period);
  const periodStart = periodStartDate
    ? formatDate(periodStartDate.endDate)
    : "Dawn of time";

  const handleClosePeriod = () => {
    closePeriod(periodId);
  };

  const handleAssign = () => {
    assignQuantifiers(periodId);
  };

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div>Period start: {periodStart}</div>
      <PeriodDateForm />

      {period.status !== "CLOSED" ? (
        <div className="mt-5">
          {period.status === "OPEN" ? (
            <button
              className="praise-button"
              onClick={() => {
                setIsAssignDialogOpen(true);
              }}
            >
              Assign quantifiers
            </button>
          ) : null}
          {period.status === "QUANTIFY" ? (
            <button
              className="praise-button"
              onClick={() => setIsCloseDialogOpen(true)}
            >
              Close period
            </button>
          ) : null}
        </div>
      ) : null}

      <Dialog
        open={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeDialogRef}
      >
        <div ref={closeDialogRef}>
          <PeriodCloseDialog
            onClose={() => setIsCloseDialogOpen(false)}
            onRemove={() => handleClosePeriod()}
          />
        </div>
      </Dialog>

      {period.status === "OPEN" && isAdmin ? (
        <Dialog
          open={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={assignDialogRef}
        >
          <div ref={assignDialogRef}>
            <PeriodAssignDialog
              onClose={() => setIsAssignDialogOpen(false)}
              onAssign={() => handleAssign()}
            />
          </div>
        </Dialog>
      ) : null}
    </div>
  );
};

export default PeriodDetails;
