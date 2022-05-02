import {
  faCalculator,
  faMinusCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { PraiseDto } from 'api/dist/praise/types';

const getPraisesString = (praises: PraiseDto[]): string =>
  praises.map((p) => `#${p._id.slice(-5)}`).join(', ');

interface DismissDialogProps {
  onClose(): void;
  onDismiss(): void;
  praises: PraiseDto[] | undefined;
}
const PoolDismissDialog = ({
  onClose,
  onDismiss,
  praises,
}: DismissDialogProps): JSX.Element | null => {
  if (!praises || praises.length === 0) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Dismiss {praises.length} praise
          </Dialog.Title>
          <Dialog.Description className="text-center mb-7">
            {getPraisesString(praises)}
          </Dialog.Description>
          <Dialog.Description className="text-center mb-7">
            Dismiss a praise when it contains no praise information or is out of
            scope for the praise system.
          </Dialog.Description>
          <div className="flex justify-center">
            <button
              className="mt-4 praise-button"
              onClick={(): void => {
                onDismiss();
                onClose();
              }}
            >
              <FontAwesomeIcon
                className="mr-2"
                icon={faMinusCircle}
                size="1x"
              />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDismissDialog;
