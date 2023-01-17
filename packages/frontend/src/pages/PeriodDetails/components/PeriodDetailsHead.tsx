import { InlineLabel } from '@/components/ui/InlineLabel';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { PeriodStatsSelector } from '@/model/periods/periodAnalytics';
import {
  AllPeriods,
  PeriodPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
  useAssignQuantifiers,
} from '@/model/periods/periods';
import { AllQuantifierUsers } from '@/model/user/users';
import { formatIsoDateUTC, DATE_FORMAT } from '@/utils/date';
import { getPreviousPeriod } from '@/utils/periods';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@mui/material';
import React from 'react';
import toast from 'react-hot-toast';
import { useParams, useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodAssignDialog } from './AssignDialog';
import { CloseButton } from './CloseButton';
import { ExportDropdown } from './ExportDropdown';
import { PeriodDateForm } from './PeriodDateForm';
import { PeriodNameForm } from './PeriodNameForm';

export const PeriodDetailsHead = (): JSX.Element | null => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  const allQuantifiers = useRecoilValue(AllQuantifierUsers);
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const periodStats = useRecoilValue(PeriodStatsSelector(periodId));

  const history = useHistory();

  const assignDialogRef = React.useRef(null);

  const { assignQuantifiers } = useAssignQuantifiers(periodId);

  if (!period || !allPeriods) return null;

  const previousPeriod = getPreviousPeriod(allPeriods, period);

  const handleAssign = (): void => {
    const toastId = 'assignToast';
    const promise = assignQuantifiers();
    void toast.promise(
      promise,
      {
        loading: 'Assigning quantifiers …',
        success: () => {
          setTimeout(() => history.go(0), 2000);
          return 'Quantifiers assigned';
        },
        error: () => {
          setTimeout(() => toast.remove(toastId), 2000);
          return 'Assign failed';
        },
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: Infinity,
        },
      }
    );
  };

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div className={'float-right'}>
        {' '}
        <InlineLabel
          text={period?.status as string}
          className={
            period?.status === 'OPEN'
              ? 'bg-themecolor-alt-1/50'
              : period?.status === 'QUANTIFY'
              ? 'bg-themecolor-alt-1'
              : 'bg-themecolor-alt-1/30'
          }
        />
      </div>
      {isAdmin ? <PeriodNameForm /> : <h2>{period?.name}</h2>}

      <div>
        <span className="pr-2">Period start:</span>
        {previousPeriod
          ? formatIsoDateUTC(previousPeriod.endDate, DATE_FORMAT)
          : 'Dawn of time'}
      </div>
      {!isAdmin ? (
        <>
          <div>Period end: {formatIsoDateUTC(period.endDate)}</div>
          <div>Number of praise: {periodStats?.totalPraise}</div>
        </>
      ) : (
        <>
          <PeriodDateForm />
          <div>Number of praise: {periodStats?.totalPraise}</div>
          <div className="mt-5">
            {period.status === 'OPEN' || period.status === 'QUANTIFY' ? (
              <div className="flex justify-between gap-4">
                {period.status === 'OPEN' &&
                period.receivers &&
                period?.receivers.length > 0 &&
                allQuantifiers &&
                allQuantifiers.length > 0 ? (
                  <Button
                    onClick={(): void => {
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      size="1x"
                      className="mr-2"
                    />
                    Assign quantifiers
                  </Button>
                ) : null}
                {period.status === 'QUANTIFY' && isAdmin ? (
                  <ExportDropdown />
                ) : null}
                <CloseButton />
              </div>
            ) : null}

            {period.status === 'CLOSED' && isAdmin ? <ExportDropdown /> : null}
          </div>
        </>
      )}

      {period.status === 'OPEN' && isAdmin ? (
        <Dialog
          open={isAssignDialogOpen}
          onClose={(): void => setIsAssignDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={assignDialogRef}
        >
          <div ref={assignDialogRef}>
            <PeriodAssignDialog
              onClose={(): void => setIsAssignDialogOpen(false)}
              onAssign={(): void => handleAssign()}
            />
          </div>
        </Dialog>
      ) : null}
    </div>
  );
};
