import {
  faCalculator,
  faMinusCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Praise } from '@/model/praise/praise.dto';

import { Button } from '@/components/ui/Button';
import { ScrollableDialog } from '@/components/ui/ScrollableDialog';
import { idLabel } from '@/model/praise/praise.utils';

interface DismissDialogProps {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  praises: Praise[] | undefined;
}

export const DismissDialog = ({
  open = false,
  onClose,
  onConfirm,
  praises,
}: DismissDialogProps): JSX.Element | null => {
  if (!praises || praises.length === 0) return null;

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
          <h2 className="text-center">Dismiss {praises.length} praise</h2>
          <p>
            Dismiss a praise when it contains no praise information or is out of
            scope for the praise system.
          </p>
          <p className="text-center">
            {praises.map((p) => idLabel(p._id)).join(', ')}
          </p>
          <div className="flex justify-center">
            <Button
              className="space-x-2"
              onClick={(): void => {
                onConfirm();
                onClose();
              }}
            >
              <FontAwesomeIcon icon={faMinusCircle} size="1x" />
              <span>Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};
