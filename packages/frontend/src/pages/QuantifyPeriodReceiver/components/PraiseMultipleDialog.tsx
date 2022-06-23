import ScrollableDialog from '@/components/ScrollableDialog';
import PraiseMultipleButton from '@/pages/QuantifyPeriodReceiver/components/PraiseMultipleButton';
import QuantifySlider from '@/pages/QuantifyPeriodReceiver/components/QuantifySlider';
import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import { useState } from 'react';

interface PraiseMultipleDialogProps {
  open: boolean;
  onClose(): void;
  selectedPraises: PraiseDto[];
  allowedValues: number[];
  onSetScore(newScore: number, selectedPraises: PraiseDto[]);
}

const PraiseMultipleDialog = ({
  open = false,
  onClose,
  selectedPraises,
  allowedValues,
  onSetScore,
}: PraiseMultipleDialogProps): JSX.Element | null => {
  const [score, setScore] = useState<number>(0);

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <h2 className="text-center">
            Quantify selected ({selectedPraises.length}) praises
          </h2>

          <div className="text-center">
            <QuantifySlider
              allowedScores={allowedValues}
              onChange={(newScore): void => setScore(newScore)}
            />
          </div>

          <div className="flex justify-center">
            <PraiseMultipleButton
              onClick={(): void => {
                onSetScore(score, selectedPraises);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};

export default PraiseMultipleDialog;
