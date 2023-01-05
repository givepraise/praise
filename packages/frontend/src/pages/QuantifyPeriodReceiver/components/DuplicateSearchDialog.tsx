import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from '@/model/praise/praise.dto';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Button } from '@/components/ui/Button';
import { ScrollableDialog } from '@/components/ui/ScrollableDialog';
import { PeriodPageParams } from '@/model/periods';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings';

import { PraiseAutosuggest } from './PraiseAutosuggest';

interface Props {
  onClose(): void;
  onConfirm(duplicatePraise: string): void;
  open: boolean;
  selectedPraise: PraiseDto | undefined;
}

export const DuplicateSearchDialog = ({
  onClose,
  onConfirm,
  open = false,
  selectedPraise,
}: Props): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const duplicatePraisePercentage = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    })
  ) as number;

  if (!selectedPraise) return null;

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <Button variant={'round'} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <h2 className="text-center">Mark praise as duplicate</h2>
          {duplicatePraisePercentage && (
            <p className="text-center">
              Enter the original praise ID:
              <br />
              The duplicate will receive {duplicatePraisePercentage * 100}% of
              its value.
            </p>
          )}
          <div className="flex justify-center">
            <PraiseAutosuggest
              onSelect={onConfirm}
              onClose={onClose}
              praise={selectedPraise}
            />
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};
