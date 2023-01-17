import { Button } from '@/components/ui/Button';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { PeriodCloseDialog } from './CloseDialog';
import { PeriodPageParams, useClosePeriod } from '@/model/periods/periods';
import { useParams } from 'react-router-dom';

export const CloseButton = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  const { closePeriod } = useClosePeriod();
  const closeDialogRef = React.useRef(null);

  const handleClosePeriod = (): void => {
    void closePeriod(periodId);
  };

  return (
    <>
      <Button
        variant={'outline'}
        onClick={(): void => setIsCloseDialogOpen(true)}
      >
        <FontAwesomeIcon icon={faTimesCircle} size="1x" className="mr-2" />
        Close period
      </Button>
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
    </>
  );
};
