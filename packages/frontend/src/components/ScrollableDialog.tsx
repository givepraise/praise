import OutsideClickHandler from '@/components/OutsideClickHandler';

interface PoolDeleteDialogProps {
  onClose(): void;
  open: boolean;
  children: JSX.Element;
}
const ScrollableDialog = ({
  onClose,
  open,
  children,
}: PoolDeleteDialogProps): JSX.Element | null => {
  if (!open) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-20">
      <div className="fixed w-full h-screen">
        <div className="flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-30">
          <OutsideClickHandler onOutsideClick={onClose} active={open}>
            <div className="z-30 max-w-xl bg-white rounded">
              <div className="pb-16 bg-white rounded">{children}</div>
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    </div>
  );
};

export default ScrollableDialog;
