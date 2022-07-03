import { OutsideClickHandler } from '@/components/OutsideClickHandler';

interface PoolDeleteDialogProps {
  onClose(): void;
  open: boolean;
  children: JSX.Element;
}

export const ScrollableDialog = ({
  onClose,
  open,
  children,
}: PoolDeleteDialogProps): JSX.Element | null => {
  if (!open) return null;

  return (
    <div className="absolute top-0 left-0 z-20 w-full h-full">
      <div className="fixed w-full h-screen">
        <div className="flex items-center justify-center w-full h-full bg-warm-gray-800 bg-opacity-30">
          <OutsideClickHandler onOutsideClick={onClose} active={open}>
            <div className="z-30 max-w-xl praise-box-defaults">
              <div className="pb-16">{children}</div>
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    </div>
  );
};
