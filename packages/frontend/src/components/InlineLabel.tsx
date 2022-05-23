import { classNames } from '../utils';

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
    <span
      onClick={onClick}
      className={classNames(
        className,
        'inline-block pl-1 pr-1 mr-1 text-xs text-white no-underline bg-gray-800 py-[1px] rounded break-normal',
        onClick ? 'cursor-pointer' : ''
      )}
      title={title}
    >
      {text}
      {button && button}
    </span>
  );
};
