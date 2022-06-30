import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  disabled?: boolean;
  icon: IconProp;
  text: string;
  onClick();
}

export const IconButton = ({
  disabled = false,
  icon,
  text,
  onClick,
}: Props): JSX.Element => {
  return (
    <button
      disabled={disabled}
      className={
        disabled
          ? 'praise-button-disabled space-x-2'
          : 'praise-button space-x-2'
      }
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} size="1x" />
      <span>{text}</span>
    </button>
  );
};
