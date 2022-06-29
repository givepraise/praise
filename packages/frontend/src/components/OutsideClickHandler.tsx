import React, { useEffect, useCallback } from 'react';
import { useOutsideAlerter } from '@/utils/index';

interface OutsideClickHandlerProps {
  onOutsideClick: (() => void) | undefined;
  active: boolean;
  children?: React.ReactNode;
}

export const OutsideClickHandler: React.FC<OutsideClickHandlerProps> = ({
  onOutsideClick,
  active,
  children,
}) => {
  const wrapperRef = React.useRef(null);
  const { timestamp, reset } = useOutsideAlerter(wrapperRef);

  const escFunction = useCallback(
    (event) => {
      if (event.key === 'Escape' && active && onOutsideClick) onOutsideClick();
    },
    [active, onOutsideClick]
  );

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  useEffect(() => {
    if (!active || timestamp === 0) return;
    if (onOutsideClick) onOutsideClick();
    reset(); // Ensure click only get handled once
  }, [timestamp, active, reset, onOutsideClick]);

  return <div ref={wrapperRef}> {children}</div>;
};
