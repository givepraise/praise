import { Tooltip } from '@mui/material';

import { classNames } from '../../utils/';

interface InlineLabelProps {
  text: string;
  title?: string;
  button?: JSX.Element;
  className?: string;
  onClick?: () => void;
}

export const InlineLabel = ({
  text,
  title,
  button,
  className,
  onClick,
}: InlineLabelProps): JSX.Element => {
  return (
    <Tooltip placement="top-start" title={!title ? '' : title} arrow>
      <span
        onClick={onClick}
        className={classNames(
          className,
          'h-6 pl-1 pr-1 mr-1 whitespace-nowrap text-xs text-white no-underline bg-warm-gray-800 py-[1px] rounded',
          onClick ? 'cursor-pointer' : ''
        )}
      >
        {text}
        {button && button}
      </span>
    </Tooltip>
  );
};
