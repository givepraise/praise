import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { classNames } from '../../utils';

interface TooltipProps {
  title: string;
  placement: string;
  disabled: boolean;
  children: JSX.Element;
}

export const Tooltip = ({
  title,
  children,
  disabled,
}: TooltipProps): JSX.Element | null => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [openTimeout, setOpenTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [closeTimeout, setCloseTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (ref.current?.offsetWidth) {
      setWidth(ref.current.offsetWidth);
    }
  }, [open]);

  return (
    <div className="inline-block">
      <div
        onPointerEnter={(): void => {
          closeTimeout && clearTimeout(closeTimeout);
          !open && setOpenTimeout(setTimeout(() => setOpen(true), 100));
        }}
        onPointerLeave={(): void => {
          openTimeout && clearTimeout(openTimeout);
          setCloseTimeout(setTimeout(() => setOpen(false), 100));
        }}
      >
        {children}
      </div>

      {open && !disabled && (
        <div className="absolute z-10">
          <div
            ref={ref}
            className="relative flex flex-col items-center"
            onPointerEnter={(): void => {
              closeTimeout && clearTimeout(closeTimeout);
            }}
            onPointerLeave={(): void => {
              openTimeout && clearTimeout(openTimeout);
              setTimeout(() => setOpen(false), 100);
            }}
            style={{ left: `-${width / 2 - 14}px` }}
          >
            <div className="inline-block w-3 overflow-hidden">
              <div className="w-2 h-2 origin-bottom-left transform rotate-45 bg-warm-gray-600 dark:bg-slate-700"></div>
            </div>
            <div className="p-1 text-xs text-white rounded shadow-md bg-warm-gray-600 dark:bg-slate-700">
              {title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface IconButtonRoundProps {
  disabled?: boolean;
  icon: IconProp;
  tooltip: string;
  onClick();
}

export const IconButtonRound = ({
  disabled = false,
  icon,
  tooltip,
  onClick,
}: IconButtonRoundProps): JSX.Element => {
  const classNamesActive =
    'hover:bg-warm-gray-300 dark:text-white dark:hover:bg-slate-800';
  const classNamesDisabled =
    'cursor-default text-gray-900/50 dark:text-white/50';

  return (
    <Tooltip placement="bottom" title={tooltip} disabled={disabled}>
      <button
        disabled={disabled}
        className={classNames(
          'flex items-center justify-center rounded-full w-7 h-7',
          disabled ? classNamesDisabled : classNamesActive
        )}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} size="1x" />
      </button>
    </Tooltip>
  );
};
