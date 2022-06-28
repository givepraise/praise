import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  small?: boolean;
  onClick();
}

const MarkDismissedButton = ({
  disabled = false,
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
      <FontAwesomeIcon icon={faMinusCircle} size="1x" />
      {!small ? <span>Dismiss</span> : null}
    </button>
  );
};

export default MarkDismissedButton;
