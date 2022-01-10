import { User } from "@/model/users";
import { getUsername } from "@/utils/users";
import {
  faMinusCircle,
  faTimes,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";

interface PoolDeleteDialogProps {
  onClose(): any;
  onQuantifierRemoved(id: string): void;
  quantifier: User | undefined;
}
const PoolDeleteDialog = ({
  onClose,
  onQuantifierRemoved,
  quantifier,
}: PoolDeleteDialogProps) => {
  if (quantifier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
          <div className="flex justify-end p-6">
            <button className="praise-button-round" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </button>
          </div>
          <div className="px-20">
            <div className="flex justify-center mb-7">
              <FontAwesomeIcon icon={faUserFriends} size="2x" />
            </div>
            <Dialog.Title className="mb-5 text-center">
              Removing 1 member from Quantifier Pool
            </Dialog.Title>
            <div className="flex justify-center mb-5">
              {getUsername(quantifier)}
            </div>
            <div className="flex justify-center">
              <button
                className="praise-button"
                onClick={() => {
                  onQuantifierRemoved(quantifier._id);
                  onClose();
                }}
              >
                <FontAwesomeIcon
                  className="mr-2"
                  icon={faMinusCircle}
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
