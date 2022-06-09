import { faCalculator, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableDialog from '@/components/ScrollableDialog';
import { PraiseDto } from 'shared/dist/praise/types';
import MarkDismissedButton from './MarkDismissedButton';

const getPraisesString = (praises: PraiseDto[]): string =>
  praises.map((p) => `#${p._id.slice(-5)}`).join(', ');

interface DismissDialogProps {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  praises: PraiseDto[] | undefined;
}
const PoolDismissDialog = ({
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
          <p className="text-center">{getPraisesString(praises)}</p>
          <div className="flex justify-center">
            <MarkDismissedButton
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

export default PoolDismissDialog;
