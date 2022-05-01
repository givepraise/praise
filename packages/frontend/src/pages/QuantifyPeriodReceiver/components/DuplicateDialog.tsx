import ScrollableDialog from '@/components/ScrollableDialog';
import {
  faCalculator,
  faTimes,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PeriodPageParams } from '@/model/periods';
import { useParams } from 'react-router-dom';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';

const getPraisesString = (praiseIds: string[]): string =>
  praiseIds.map((praiseId) => praiseId.slice(-5)).join(', ');

interface DuplicateDialogProps {
  onClose(): void;
  onConfirm(): void;
  open: boolean;
  praiseIds: string[] | undefined;
}

const DuplicateDialog = ({
  onClose,
  onConfirm,
  open = false,
  praiseIds,
}: DuplicateDialogProps): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const duplicatePraisePercentage = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  ) as number;

  if (!praiseIds || praiseIds.length < 2) return null;

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
            Mark praise #{getPraisesString(praiseIds)} as duplicate
          </h2>
          {duplicatePraisePercentage && (
            <p className="text-center mb-7">
              Duplicate praise are given a score that is{' '}
              {duplicatePraisePercentage * 100}% of the original quantification.
            </p>
          )}
          <div className="flex justify-center">
            <button
              className="mt-4 praise-button"
              onClick={(): void => {
                onConfirm();
                onClose();
              }}
            >
              <FontAwesomeIcon className="mr-2" icon={faCopy} size="1x" />
              Mark as duplicates
            </button>
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};

export default DuplicateDialog;
