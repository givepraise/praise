import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { PraiseDto } from 'api/dist/praise/types';
import PraiseAutosuggest from './PraiseAutosuggest';

interface PoolDeleteDialogProps {
  onClose(): any;
  onSelect(praiseId: string): void;
  praise: PraiseDto;
}
const PoolDismissDialog = ({
  onSelect,
  onClose,
  praise,
}: PoolDeleteDialogProps) => {
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
              Mark praise #{praise._id.slice(-4)} as duplicate
            </Dialog.Title>

            <div className="flex justify-center">
              <PraiseAutosuggest
                onSelect={onSelect}
                onClose={onClose}
                praise={praise}
              />
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
