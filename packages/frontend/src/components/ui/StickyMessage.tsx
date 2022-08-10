import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface StickyMessageProps {
  onClose: () => void;
  children: JSX.Element | JSX.Element[] | string;
}

export const StickyMessage = ({
  onClose,
  children,
}: StickyMessageProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleClose = (): void => {
    onClose();
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div className="flex items-center justify-center sticky top-0 p-3 text-center bg-opacity-50 bg-warm-gray-100 lg:pl-64">
          <div className="ml-auto">{children}</div>
          <div className="ml-auto">
            <button className="praise-button-round" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
