import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleUnbalanced } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  small?: boolean;
  onClick();
}

const QuantifyMultipleButton = ({
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
      <FontAwesomeIcon icon={faScaleUnbalanced} size="1x" />
      {!small ? <span>Quantify</span> : null}
    </button>
  );
};

export default QuantifyMultipleButton;
