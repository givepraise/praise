import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { classNames } from '../utils';

interface Props {
  disabled?: boolean;
  icon: IconProp;
  text: string;
  onClick();
}

const IconButton = ({
  disabled = false,
  icon,
  text,
  onClick,
}: Props): JSX.Element => {
  return (
    <button
      disabled={disabled}
      className={classNames(
        'space-x-2',
        disabled ? 'praise-button-disabled' : 'praise-button'
      )}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} size="1x" />
      <span>{text}</span>
    </button>
  );
};

export default IconButton;
