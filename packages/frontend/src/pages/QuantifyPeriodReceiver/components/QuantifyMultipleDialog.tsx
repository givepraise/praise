import {
  faCalculator,
  faScaleUnbalanced,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import { useState } from 'react';

import { PraiseButton } from '@/components/ui/PraiseButton';
import { ScrollableDialog } from '@/components/ui/ScrollableDialog';
import { QuantifySlider } from '@/pages/QuantifyPeriodReceiver/components/QuantifySlider';

interface QuantifyMultipleDialogProps {
  open: boolean;
  onClose(): void;
  selectedPraises: PraiseDto[];
  allowedValues: number[];
  onSetScore(newScore: number, selectedPraises: PraiseDto[]);
}

export const QuantifyMultipleDialog = ({
  open = false,
  onClose,
  selectedPraises,
  allowedValues,
  onSetScore,
}: QuantifyMultipleDialogProps): JSX.Element | null => {
  const [score, setScore] = useState<number>(0);

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <PraiseButton variant={'round'} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </PraiseButton>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <h2 className="text-center">
            Quantify selected ({selectedPraises.length}) praise items.
          </h2>

          <div className="text-center">
            <QuantifySlider
              allowedScores={allowedValues}
              onChange={(newScore): void => setScore(newScore)}
            />
          </div>

          <div className="flex justify-center">
            <PraiseButton
              classes="space-x-2"
              onClick={(): void => {
                onSetScore(score, selectedPraises);
                onClose();
              }}
            >
              <FontAwesomeIcon icon={faScaleUnbalanced} size="1x" />
              <span>Quantify</span>
            </PraiseButton>
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};
