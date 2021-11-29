import {
  faTimes,      
  faCalculator
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import PraiseAutosuggest from "@/components/quantify/PraiseAutosuggest";
import { Praise } from "@/model/praise";

interface PoolDeleteDialogProps {
  onClose(): any;
  onDuplicate(id: number, fid: number): void
  praise: Praise | undefined
}
const PoolDismissDialog = ({ onDuplicate, onClose, praise }: PoolDeleteDialogProps) => {

  const handleSetAsDuplicate = (fid: number) => {
    if (praise) {
      onDuplicate(praise.id, fid);
      onClose();
    }    
  }

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
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Duplicate              
          </Dialog.Title>
          
          <div className="flex justify-center">
            <PraiseAutosuggest onSelect={() => handleSetAsDuplicate} />
          </div>          
        </div>
      </div>
    </div>
  );
};

export default PoolDismissDialog;
