import {
  faCalendarAlt,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface PeriodCloseDialogProps {
  onClose(): void;
  onRemove(): void;
}

export const PeriodCloseDialog = ({
  onClose,
  onRemove,
}: PeriodCloseDialogProps): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant="round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">Close period</Dialog.Title>
          <Dialog.Description className="text-center mb-7">
            Closing a period means no more quantifications can be performed. A
            closed period cannot be re-opened.
          </Dialog.Description>
          <div className="flex justify-center">
            <Button
              className="mt-4 bg-red-600"
              onClick={(): void => {
                onRemove();
                onClose();
              }}
            >
              <FontAwesomeIcon
                className="mr-2"
                icon={faTimesCircle}
                size="1x"
              />
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
