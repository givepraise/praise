import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  onClick();
}

export const MarkDismissedButton = ({
  disabled = false,
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
      <FontAwesomeIcon icon={faMinusCircle} size="1x" />
      <span>Dismiss</span>
    </button>
  );
};
