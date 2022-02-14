import { useOutsideAlerter } from '@/utils/index';
import React from 'react';

interface OutsideClickHandlerProps {
  onOutsideClick(): any;
  active: boolean;
  children?: React.ReactNode;
}
const OutsideClickHandler: React.FC<OutsideClickHandlerProps> = ({
  onOutsideClick,
  active,
  children,
}) => {
  const wrapperRef = React.useRef(null);
  const { timestamp, reset } = useOutsideAlerter(wrapperRef);

  React.useEffect(() => {
    if (!active || timestamp === 0) return;
    if (onOutsideClick) onOutsideClick();
    reset(); // Ensure click only get handled once
  }, [timestamp, active, reset, onOutsideClick]);

  return <div ref={wrapperRef}> {children}</div>;
};

export default OutsideClickHandler;
