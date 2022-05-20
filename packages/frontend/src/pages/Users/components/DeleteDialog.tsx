import {
  faTimes,
  faTimesCircle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { UserDto } from 'api/dist/user/types';

interface PoolDeleteDialogProps {
  onClose(): void;
  onQuantifierRemoved(id: string): void;
  quantifier: UserDto | undefined;
}
const PoolDeleteDialog = ({
  onClose,
  onQuantifierRemoved,
  quantifier,
}: PoolDeleteDialogProps): JSX.Element | null => {
  if (quantifier) {
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
              <FontAwesomeIcon icon={faUser} size="2x" />
            </div>
            <Dialog.Title className="mb-5 text-center">
              Removing 1 member from Quantifier Pool
            </Dialog.Title>
            <div className="flex justify-center mb-5">
              {quantifier.nameRealized}
            </div>
            <div className="flex justify-center">
              <button
                className="bg-red-600 praise-button"
                onClick={(): void => {
                  if (quantifier._id) {
                    onQuantifierRemoved(quantifier._id);
                  }
                  onClose();
                }}
              >
                <FontAwesomeIcon
                  className="mr-2"
                  icon={faTimesCircle}
                  size="1x"
                />
                Remove member
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

export default PoolDeleteDialog;
