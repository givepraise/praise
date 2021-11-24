import { UserIdentity } from "@/model/users";
import {
  faTimes,  
  faUserFriends,
  faMinusCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";

interface PoolDeleteDialogProps {
  onClose(): any;
  onQuantifierRemoved(id: number): void
  quantifier: UserIdentity | undefined
}
const PoolDeleteDialog = ({ onClose, onQuantifierRemoved, quantifier }: PoolDeleteDialogProps) => {  
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
            <Dialog.Title className="text-center mb-7">
              Removing 1 member from Quantifier Pool
            </Dialog.Title>
            <div className="flex justify-center">
              { quantifier.id }
            </div>
            <div className="flex justify-center">
              <button className="praise-button mt-4" onClick={() => {onQuantifierRemoved(quantifier.id); onClose();}}>
                <FontAwesomeIcon className="mr-2" icon={faMinusCircle} size="1x" />
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
