import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  small?: boolean;
  onClick();
}

const MarkDuplicateButton = ({
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
      <FontAwesomeIcon icon={faCopy} size="1x" />
      {!small ? <span>Mark as duplicates</span> : null}
    </button>
  );
};

export default MarkDuplicateButton;
