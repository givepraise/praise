import { faTimesCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Button } from '@/components/ui/Button';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import {
  AllPeriods,
  PeriodPageParams,
  SinglePeriod,
  useAssignQuantifiers,
  useClosePeriod,
  useLoadSinglePeriodDetails,
} from '@/model/periods/periods';
import { AllQuantifierUsers } from '@/model/user/users';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { getPreviousPeriod } from '@/utils/periods';
import { PeriodStatsSelector } from '@/model/periods/periodAnalytics';
import { PeriodAssignDialog } from './AssignDialog';
import { PeriodCloseDialog } from './CloseDialog';
import { PeriodDateForm } from './PeriodDateForm';
import { ExportDropdown } from './ExportDropdown';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { PeriodNameForm } from './PeriodNameForm';

export const PeriodDetailsHead = (): JSX.Element | null => {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
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
  const closeDialogRef = React.useRef(null);

  const { closePeriod } = useClosePeriod();
  const { assignQuantifiers } = useAssignQuantifiers(periodId);

  if (!period || !allPeriods) return null;

  const previousPeriod = getPreviousPeriod(allPeriods, period);

  const handleClosePeriod = (): void => {
    void closePeriod(periodId);
  };

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
                <Button
                  variant={'outline'}
                  onClick={(): void => setIsCloseDialogOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    className="mr-2"
                  />
                  Close period
                </Button>
              </div>
            ) : null}

            {period.status === 'CLOSED' && isAdmin ? <ExportDropdown /> : null}
          </div>
        </>
      )}

      <Dialog
        open={isCloseDialogOpen}
        onClose={(): void => setIsCloseDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeDialogRef}
      >
        <div ref={closeDialogRef}>
          <PeriodCloseDialog
            onClose={(): void => setIsCloseDialogOpen(false)}
            onRemove={(): void => handleClosePeriod()}
          />
        </div>
      </Dialog>

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
