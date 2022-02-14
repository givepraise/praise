import { Praise } from '@/model/praise';
import {
  faCalculator,
  faMinusCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';

interface DismissDialogProps {
  onClose(): any;
  onDismiss(): any;
  praise: Praise | undefined;
}
const PoolDismissDialog = ({
  onClose,
  onDismiss,
  praise,
}: DismissDialogProps) => {
  if (praise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
        <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
          <div className="flex justify-end p-6">
            <button className="praise-button-round" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </button>
          </div>
          <div className="px-20">
            <div className="flex justify-center mb-7">
              <FontAwesomeIcon icon={faCalculator} size="2x" />
            </div>
            <Dialog.Title className="text-center mb-7">
              Dismiss praise #{praise._id.slice(-5)}
            </Dialog.Title>
            <Dialog.Description className="text-center mb-7">
              Dismiss a praise when it contains no praise information or is out
              of scope for the praise system.
            </Dialog.Description>
            <div className="flex justify-center">
              <button
                className="mt-4 praise-button"
                onClick={() => {
                  onDismiss();
                  onClose();
                }}
              >
                <FontAwesomeIcon
                  className="mr-2"
                  icon={faMinusCircle}
                  size="1x"
                />
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default PoolDismissDialog;
