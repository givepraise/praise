import ScrollableDialog from '@/components/ScrollableDialog';
import Praise from '@/components/praise/Praise';
import {
  faCalculator,
  faTimes,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PeriodPageParams } from '@/model/periods';
import { PraiseDto } from 'api/dist/praise/types';
import { useParams } from 'react-router-dom';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';

interface DuplicateDialogProps {
  onClose(): void;
  onConfirm(): void;
  open: boolean;
  originalPraise: PraiseDto | undefined;
  duplicatesCount: number;
}

const DuplicateDialog = ({
  onClose,
  onConfirm,
  open = false,
  originalPraise,
  duplicatesCount,
}: DuplicateDialogProps): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const duplicatePraisePercentage = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  ) as number;

  if (!originalPraise || duplicatesCount < 2) return null;

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
            Mark {duplicatesCount} praise as duplicates
          </h2>
          {duplicatePraisePercentage && (
            <p className="text-center mb-7 max-w-2/3">
              Set a score for the first praise in the series.
              <br />
              The remaining {duplicatesCount - 1} praise will be marked as
              duplicates of that one and receive{' '}
              {duplicatePraisePercentage * 100}% of its value.
            </p>
          )}
          <Praise praise={originalPraise} className="bg-gray-100 px-4 mb-4" />
          <div className="flex justify-center">
            <button
              className="mt-4 praise-button"
              onClick={(): void => {
                onConfirm();
                onClose();
              }}
            >
              <FontAwesomeIcon className="mr-2" icon={faCopy} size="1x" />
              Mark duplicates
            </button>
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};

export default DuplicateDialog;
