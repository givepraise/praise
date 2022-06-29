import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  disabled?: boolean;
  small?: boolean;
  icon: IconProp;
  text: string;
  onClick();
}

const IconButton = ({
  disabled = false,
  icon,
  text,
  onClick,
  small,
}: Props): JSX.Element => {
  const disabledClass = disabled ? 'praise-button-disabled' : 'praise-button';
  const smallClass = small ? 'praise-button-round' : '';

  return (
    <button
      disabled={disabled}
      className={`space-x-2 ${disabledClass} ${smallClass}`}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} size="1x" />
      {!small ? <span>{text}</span> : null}
    </button>
  );
};

export default IconButton;
