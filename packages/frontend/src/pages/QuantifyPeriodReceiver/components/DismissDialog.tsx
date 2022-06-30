import {
  faCalculator,
  faMinusCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import { ScrollableDialog } from '@/components/ScrollableDialog';
import { IconButton } from '@/components/IconButton';

interface DismissDialogProps {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  praises: PraiseDto[] | undefined;
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
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
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
            {praises.map((p) => p._idLabelRealized).join(', ')}
          </p>
          <div className="flex justify-center">
            <IconButton
              icon={faMinusCircle}
              text="Dismiss"
              onClick={(): void => {
                onConfirm();
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};
