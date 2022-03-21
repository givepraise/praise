import ScrollableDialog from '@/components/ScrollableDialog';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import PraiseAutosuggest from './PraiseAutosuggest';

interface DuplicateDialogProps {
  onClose(): void;
  onSelect(praiseId: string): void;
  open: boolean;
  praise: PraiseDto | undefined;
}

const DuplicateDialog = ({
  onSelect,
  onClose,
  open = false,
  praise,
}: DuplicateDialogProps): JSX.Element | null => {
  if (!praise) return null;

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
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
    </ScrollableDialog>
  );
};

export default DuplicateDialog;
