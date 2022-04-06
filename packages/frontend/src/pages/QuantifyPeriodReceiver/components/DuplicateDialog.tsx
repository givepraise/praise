import ScrollableDialog from '@/components/ScrollableDialog';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import PraiseAutosuggest from './PraiseAutosuggest';
import { PeriodPageParams } from '@/model/periods';
import { useParams } from 'react-router-dom';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';

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
  const { periodId } = useParams<PeriodPageParams>();

  const duplicatePraisePercentage = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  ) as number;

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
          {duplicatePraisePercentage && (
            <p className="text-center mb-7">
              Duplicate praise are given a score that is{' '}
              {duplicatePraisePercentage * 100}% of the original quantification.
            </p>
          )}

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
