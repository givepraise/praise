import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import PraiseAutosuggest from './PraiseAutosuggest';

interface PoolDeleteDialogProps {
  onClose(): void;
  onSelect(praiseId: string): void;
  praise: PraiseDto | undefined;
}
const PoolDismissDialog = ({
  onSelect,
  onClose,
  praise,
}: PoolDeleteDialogProps): JSX.Element | null => {
  if (praise) {
    return (
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="fixed w-full h-screen">
          <div className="flex w-full h-full justify-center items-center bg-gray-800 bg-opacity-30">
            <div className="bg-white max-w-xl h-64 z-20">
              <div className="bg-white rounded pb-16">
                <div className="flex justify-end p-6">
                  <button className="praise-button-round" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} size="1x" />
                  </button>
                </div>
                <div className="px-20">
                  <div className="flex justify-center mb-7">
                    <FontAwesomeIcon icon={faCalculator} size="2x" />
                  </div>
                  <h2 className="text-center mb-7">
                    Mark praise #{praise._id.slice(-4)} as duplicate
                  </h2>

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
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default PoolDismissDialog;
