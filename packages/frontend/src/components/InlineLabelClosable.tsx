import { classNames } from '../utils';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  text: string;
  button?: JSX.Element;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
}

export const InlineLabelClosable = ({
  text,
  className,
  onClick,
  onClose,
}: Props): JSX.Element => {
  return (
    <span
      onClick={onClick}
      className={classNames(
        className,
        'h-6 pl-1 pr-1 mr-1 text-xs text-white no-underline bg-gray-800 py-[1px] rounded',
        onClick ? 'cursor-pointer' : ''
      )}
    >
      {text}
      <button className="ml-2" onClick={onClose}>
        <FontAwesomeIcon
          className="text-white text-opacity-50 hover:text-opacity-100"
          icon={faTimes}
          size="1x"
        />
      </button>
    </span>
  );
};
