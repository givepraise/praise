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
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="fixed w-full h-screen">
        <div className="flex w-full h-full justify-center items-center bg-gray-800 bg-opacity-30">
          <OutsideClickHandler onOutsideClick={onClose} active={open}>
            <div className="bg-white max-w-xl h-64 z-20">
              <div className="bg-white rounded pb-16">{children}</div>
            </div>
          </OutsideClickHandler>
        </div>
      </div>
    </div>
  );
};

export default ScrollableDialog;
