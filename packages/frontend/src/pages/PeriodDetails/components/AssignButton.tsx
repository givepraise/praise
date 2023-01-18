import {
  PeriodPageParams,
  SinglePeriod,
  useAssignQuantifiers,
} from '@/model/periods/periods';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import toast from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { PeriodAssignDialog } from './AssignDialog';
import { Button } from '@/components/ui/Button';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { useRecoilValue } from 'recoil';

export const AssignButton = (): JSX.Element | null => {
  const history = useHistory();
  const { periodId } = useParams<PeriodPageParams>();

  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { assignQuantifiers } = useAssignQuantifiers(periodId);

  const assignDialogRef = React.useRef(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

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

  if (!period) return null;

  return (
    <>
      <Button
        onClick={(): void => {
          setIsAssignDialogOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faUsers} size="1x" className="mr-2" />
        Assign quantifiers
      </Button>
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
    </>
  );
};
